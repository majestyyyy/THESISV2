"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { Flag, FileText, ArrowRight } from "lucide-react"
import { QuestionDisplay } from "@/components/quiz/question-display"
import { QuizTimer } from "@/components/quiz/quiz-timer"
import { AuthRequired } from "@/components/auth/auth-required"
// Removed DashboardLayout import for focused quiz experience
import { createQuizSession, calculateQuizResults } from "@/lib/quiz-session"
import { getQuizById } from "@/lib/quiz-utils"
import { saveQuizAttempt } from "@/lib/quiz-attempts"
import { supabase } from "@/lib/supabase"
import { studySessionTracker } from "@/lib/study-session-tracker"
import type { QuizSession } from "@/lib/quiz-session"
import type { Quiz } from "@/lib/quiz-utils"

export default function TakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const resolvedParams = use(params)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<QuizSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<number>>(new Set())
  const [isTimerVisible, setIsTimerVisible] = useState(true)

    // TTS state
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null)

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
    // Stop TTS when unmounting or navigating away
    return () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };
  }, [])

  // TTS handler for current question
  const handleListenQuestion = () => {
    if (!quiz) return;
    const questionText = quiz.questions[currentQuestion]?.questionText;
    if (!questionText) return;
    // Stop any ongoing speech
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    // Create and play utterance
    const utterance = new window.SpeechSynthesisUtterance(questionText);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };
    setCurrentUtterance(utterance);
    window.speechSynthesis.speak(utterance);
    };
    // Stop TTS
    const handleStopSpeaking = () => {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };

  useEffect(() => {
    if (!isHydrated) return // Wait for hydration

    const loadQuiz = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Add a small delay to ensure proper client-side initialization
        await new Promise(resolve => setTimeout(resolve, 100))
        
        console.log("Loading quiz with ID:", resolvedParams.id)
        
        const quizData = await getQuizById(resolvedParams.id)
        console.log("Quiz data received:", quizData)
        
        if (!quizData) {
          setError("Quiz not found")
          return
        }
        setQuiz(quizData)
        
        // Get current user for session tracking
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Start study session tracking
          await studySessionTracker.startSession({
            activityType: 'quiz',
            resourceId: resolvedParams.id,
            resourceName: quizData.title,
            metadata: {
              difficulty: quizData.difficulty,
              totalQuestions: quizData.totalQuestions
            }
          })
        }
        
        // Initialize quiz session
        const newSession = createQuizSession(resolvedParams.id, user?.id || "anonymous", quizData.totalQuestions, 30) // 30 minutes
        setSession(newSession)
        
        console.log("Quiz session created:", newSession)
        
      } catch (err) {
        console.error("Error loading quiz:", err)
        setError("Failed to load quiz. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [resolvedParams.id, isHydrated])

  useEffect(() => {
    setShowExplanation(false)
    setHasAnswered(false)
    // Stop TTS when changing question
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setCurrentUtterance(null);
  }, [currentQuestion])

  // Add keyboard support for Enter key
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter' && quiz) {
        if (!showExplanation) {
          // If explanation is not shown, submit the answer
          handleSubmitAnswer()
        } else if (currentQuestion === quiz.questions.length - 1 && showExplanation) {
          // If on last question and explanation is shown, submit quiz
          handleSubmitQuiz()
        } else if (showExplanation && currentQuestion < quiz.questions.length - 1) {
          // If explanation is shown and not on last question, go to next
          handleNextQuestion()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [currentQuestion, showExplanation, hasAnswered, quiz])

  const handleAnswerChange = (answer: string) => {
    if (!session || showExplanation || !quiz) return

    const questionId = quiz.questions[currentQuestion].id
    setSession((prev) => ({
      ...prev!,
      answers: {
        ...prev!.answers,
        [questionId]: answer,
      },
    }))
    setHasAnswered(true)
  }

  const handleSubmitAnswer = () => {
    // Allow submission even without selecting an answer (blank submission)
    setShowExplanation(true)
    // Mark current question as submitted to prevent backtracking
    setSubmittedQuestions(prev => new Set([...prev, currentQuestion]))
  }

  const handleNextQuestion = () => {
    if (!quiz) return
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  // Removed previous question functionality to prevent backtracking

  const handleTimeUp = () => {
    handleSubmitQuiz()
  }

  const handleSubmitQuiz = async () => {
    if (!session || !quiz) return

    setIsSubmitting(true)

    try {
      console.log('🎯 Starting quiz submission process...')
      
      // Get current user - ensure authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        console.error('❌ User not authenticated:', authError)
        throw new Error('Please sign in to save your quiz results')
      }

      console.log('👤 User authenticated:', user.id)
      
      // Calculate results
      const results = calculateQuizResults(session, quiz)
      console.log('📊 Quiz results calculated:', results)

      // Prepare attempt data for database
      const attemptData = {
        user_id: user.id,
        quiz_id: resolvedParams.id,
        score: results.score,
        total_questions: results.totalQuestions,
        time_taken: results.timeSpent,
        answers: results.answers
      }

      console.log('💾 Saving quiz attempt to database...')
      
      // Save directly to database
      await saveQuizAttempt(attemptData)

      console.log('✅ Quiz attempt saved successfully to database!')

      // Mark quiz as newly completed for automatic refresh
      localStorage.setItem('quiz_completed', resolvedParams.id)

      // End study session
      await studySessionTracker.endSession()
      
      // Navigate to results page with the attempt ID for immediate display
      router.push(`/quizzes/${resolvedParams.id}/results`)
    } catch (error) {
      console.error('❌ Error submitting quiz:', error)
      
      // Show error to user - don't proceed without saving
      alert(`Failed to save quiz results: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again or ensure you're signed in.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getAnsweredQuestions = () => {
    if (!session) return 0
    return Object.keys(session.answers).length
  }

  const isCurrentQuestionAnswered = () => {
    if (!session || !quiz) return false
    const questionId = quiz.questions[currentQuestion].id
    return !!session.answers[questionId]
  }

  const isCurrentAnswerCorrect = () => {
    if (!session || !quiz) return false
    const questionId = quiz.questions[currentQuestion].id
    const userAnswer = session.answers[questionId]
    const correctAnswer = quiz.questions[currentQuestion].correctAnswer

    // Handle different question types
    const question = quiz.questions[currentQuestion]
    if (question.questionType === "fill_in_blanks") {
      const userBlanks = userAnswer?.split(", ") || []
      const correctBlanks = question.blanks || []
      return (
        userBlanks.length === correctBlanks.length &&
        userBlanks.every((blank, index) => blank.toLowerCase().trim() === correctBlanks[index]?.toLowerCase().trim())
      )
    }

    if (question.questionType === "identification") {
      if (!userAnswer) return false
      
      // For identification questions, use case-insensitive comparison and trim whitespace
      const normalizedUserAnswer = userAnswer.toLowerCase().trim()
      const normalizedCorrectAnswer = correctAnswer.toLowerCase().trim()
      
      if (normalizedUserAnswer === normalizedCorrectAnswer) {
        return true
      }
      
      // Also check for partial matches or common variations
      if (normalizedCorrectAnswer.includes(' ')) {
        // Check if user answer matches any significant word in the correct answer
        const correctWords = normalizedCorrectAnswer.split(' ').filter((word: string) => word.length > 2)
        const userWords = normalizedUserAnswer.split(' ').filter((word: string) => word.length > 2)
        
        // If user provided a key word from the answer, consider it partially correct
        if (correctWords.some((word: string) => userWords.includes(word)) && userWords.length > 0) {
          return true
        }
      }
      
      return false
    }

    return userAnswer?.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
  }

  // Show loading until hydrated
  if (!isHydrated || loading) {
    return (
      <AuthRequired message="Please sign in to take quizzes and save your progress.">
        <div className="min-h-screen relative overflow-hidden">
          {/* Enhanced Loading Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 -right-8 w-96 h-96 bg-gradient-to-r from-blue-300/15 to-blue-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen space-y-6">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200/50"></div>
              <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-blue-600 absolute top-0 left-0"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-full blur-xl animate-pulse"></div>
            </div>
            <div className="text-center space-y-3 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg">
              <p className="text-2xl font-bold text-gray-800">Preparing your quiz...</p>
              <p className="text-gray-600">Creating the perfect learning experience</p>
              <div className="flex justify-center space-x-1 mt-4">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        </div>
      </AuthRequired>
    )
  }

  if (error || !quiz) {
    return (
      <AuthRequired message="Please sign in to take quizzes and save your progress.">
        <div className="min-h-screen relative overflow-hidden">
          {/* Enhanced Error Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-red-100"></div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-red-400/15 to-red-500/15 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 -right-8 w-96 h-96 bg-gradient-to-r from-red-300/10 to-red-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-gradient-to-r from-red-300/15 to-red-400/15 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-center min-h-screen">
            <div className="max-w-md bg-white/90 backdrop-blur-sm p-8 rounded-3xl border border-white/20 shadow-2xl text-center">
              <div className="mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-3xl animate-bounce">⚠️</span>
                </div>
                <p className="text-red-600 text-xl font-bold">{error || "Quiz not found"}</p>
                <p className="text-gray-600 mt-2">Something went wrong, but don't worry!</p>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-4 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold text-lg"
                >
                  🔄 Try Again
                </button>
                <button 
                  onClick={() => router.push("/quizzes")}
                  className="w-full px-6 py-4 text-gray-700 bg-white/80 border border-gray-200 rounded-2xl hover:bg-white transition-all duration-300 transform hover:scale-105 shadow-md font-semibold text-lg"
                >
                  ← Back to Quizzes
                </button>
              </div>
            </div>
          </div>
        </div>
      </AuthRequired>
    )
  }

  if (!session) {
    return (
      <AuthRequired message="Please sign in to take quizzes and save your progress.">
        <div className="min-h-screen relative overflow-hidden">
          {/* Enhanced Session Loading Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 -right-8 w-96 h-96 bg-gradient-to-r from-blue-300/15 to-blue-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          </div>
          
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen space-y-6">
            <div className="relative">
              <div className="animate-pulse bg-gradient-to-r from-blue-400 to-blue-500 rounded-full h-20 w-20 shadow-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full h-20 w-20 animate-ping opacity-20"></div>
              <div className="absolute inset-2 bg-white rounded-full animate-pulse"></div>
            </div>
            <div className="text-center space-y-3 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-xl">
              <p className="text-2xl font-bold text-gray-800">Setting up your session...</p>
              <p className="text-gray-600">Almost ready to begin!</p>
              <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </AuthRequired>
    )
  }

  return (
    <AuthRequired message="Please sign in to take quizzes and save your progress.">
      <div className="min-h-screen relative overflow-hidden">
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-blue-100"></div>
        
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/3 -right-8 w-96 h-96 bg-gradient-to-r from-blue-300/15 to-blue-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-1/3 w-80 h-80 bg-gradient-to-r from-blue-300/20 to-blue-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
          
          {/* Subtle Grid Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[length:40px_40px] animate-pulse opacity-30"></div>
          
          {/* Floating Particles */}
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-400/40 rounded-full animate-bounce delay-300"></div>
          <div className="absolute top-3/4 left-3/4 w-1 h-1 bg-blue-500/60 rounded-full animate-bounce delay-700"></div>
          <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-blue-400/50 rounded-full animate-bounce delay-1100"></div>
          <div className="absolute top-1/6 right-1/4 w-1 h-1 bg-blue-600/40 rounded-full animate-bounce delay-1500"></div>
        </div>
        
        {/* Main Content with Enhanced Backdrop */}
        <div className="relative z-10 py-8">
          <div className="max-w-5xl mx-auto space-y-8 px-6">
          {/* Enhanced Quiz Header */}
          <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-white/30 shadow-2xl shadow-blue-200/30 relative overflow-hidden">
            {/* Card inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-blue-100/50 rounded-3xl"></div>
            <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 
                  className="text-2xl font-bold text-gray-900 flex items-start mb-2 leading-tight"
                  style={{ wordBreak: 'break-word' }}
                >
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-2 rounded-xl mr-3 flex-shrink-0">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <span className="flex-1 min-w-0">{quiz.title}</span>
                </h1>
                <p className="text-gray-600 text-lg">{quiz.description}</p>
              </div>
              <div className="text-right">
                <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 text-sm rounded-full font-semibold shadow-sm">
                  {quiz.difficulty}
                </span>
              </div>
            </div>
            
            {/* Enhanced Progress Section */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-8 text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div>
                    <span className="text-gray-700">
                      Question {currentQuestion + 1} of {quiz.totalQuestions}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"></div>
                    <span className="text-gray-700">
                      {Math.round((getAnsweredQuestions() / quiz.totalQuestions) * 100)}% Complete
                    </span>
                  </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm">
                  <QuizTimer 
                    initialTime={session.timeRemaining} 
                    onTimeUp={handleTimeUp} 
                    isPaused={isSubmitting}
                    isVisible={isTimerVisible}
                    onToggleVisibility={() => setIsTimerVisible(!isTimerVisible)}
                  />
                </div>
              </div>
              <div className="relative">
                <Progress 
                  value={(getAnsweredQuestions() / quiz.totalQuestions) * 100} 
                  className="h-3 bg-white/80 rounded-full overflow-hidden"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse"></div>
              </div>
            </div>
            </div>
          </div>

          {/* Question Display */}
          <QuestionDisplay
            question={quiz.questions[currentQuestion]}
            questionNumber={currentQuestion + 1}
            totalQuestions={quiz.totalQuestions}
            selectedAnswer={session.answers[quiz.questions[currentQuestion].id] || ""}
            onAnswerChange={handleAnswerChange}
            showExplanation={showExplanation}
            isCorrect={isCurrentAnswerCorrect()}
            isSpeaking={isSpeaking}
            onPlayTTS={handleListenQuestion}
            onStopTTS={handleStopSpeaking}
          />

          {/* Enhanced Navigation */}
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/30 shadow-2xl shadow-indigo-200/30 relative overflow-hidden">
            {/* Navigation card glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 via-transparent to-blue-100/40 rounded-3xl"></div>
            <div className="relative z-10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              {/* Question Progress Indicators */}
              <div className="flex-1"></div>

            <div className="flex items-center justify-center flex-1">
              {/* Enhanced Question indicators with scroll */}
              <div className="relative bg-white/60 p-3 rounded-2xl backdrop-blur-sm">
                <div className="flex space-x-2 max-w-xs sm:max-w-md md:max-w-2xl overflow-x-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent px-2 py-1">
                  {quiz.questions.map((_, index: number) => {
                    const isSubmitted = submittedQuestions.has(index)
                    const canNavigate = index === currentQuestion || (!isSubmitted && index > currentQuestion)
                    const isAnswered = session.answers[quiz.questions[index].id]
                    
                    return (
                      <button
                        key={index}
                        onClick={() => canNavigate ? setCurrentQuestion(index) : undefined}
                        disabled={!canNavigate}
                        className={`relative flex-shrink-0 w-10 h-10 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105 ${
                          index === currentQuestion
                            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-300/50 ring-2 ring-blue-300 ring-offset-2"
                            : isSubmitted
                              ? "bg-gradient-to-r from-gray-300 to-gray-400 text-gray-600 cursor-not-allowed opacity-60"
                              : isAnswered
                                ? "bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow-md shadow-emerald-200/50"
                                : "bg-white text-gray-600 hover:bg-gradient-to-r hover:from-blue-100 hover:to-blue-200 shadow-md border border-gray-200"
                        }`}
                      >
                        {index + 1}
                        {isAnswered && !isSubmitted && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                        )}
                        {isSubmitted && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-gray-500 rounded-full border-2 border-white"></div>
                        )}
                      </button>
                    )
                  })}
                </div>
                {/* Scroll indicators */}
                {quiz.questions.length > 10 && (
                  <div className="absolute left-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="w-4 h-full bg-gradient-to-r from-white to-transparent"></div>
                  </div>
                )}
                {quiz.questions.length > 10 && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <div className="w-4 h-full bg-gradient-to-l from-white to-transparent"></div>
                  </div>
                )}
              </div>
            </div>

            {currentQuestion === quiz.questions.length - 1 ? (
              showExplanation ? (
                <button 
                  onClick={handleSubmitQuiz} 
                  disabled={isSubmitting}
                  className={`group flex items-center px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isSubmitting 
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                      : 'text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg shadow-green-300/50'
                  }`}
                >
                  <Flag className="mr-3 h-5 w-5 transition-transform group-hover:rotate-12" />
                  {isSubmitting ? "Submitting..." : "🎉 Finish Quiz"}
                </button>
              ) : (
                <button 
                  onClick={handleSubmitAnswer}
                  className="group px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-300/50"
                >
                  ✨ Submit Answer
                </button>
              )
            ) : showExplanation ? (
              <button 
                onClick={handleNextQuestion}
                className="group flex items-center px-8 py-4 text-white bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl hover:from-gray-900 hover:to-black transition-all duration-300 transform hover:scale-105 shadow-lg shadow-gray-400/50 font-semibold"
              >
                Next
                <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            ) : (
              <button 
                onClick={handleSubmitAnswer}
                className="group px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-300/50"
              >
                Submit
              </button>
            )}
            </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </AuthRequired>
  )
}
