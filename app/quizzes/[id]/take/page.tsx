"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, Flag, CheckCircle, FileText, ArrowRight } from "lucide-react"
import { QuestionDisplay } from "@/components/quiz/question-display"
import { QuizTimer } from "@/components/quiz/quiz-timer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { createQuizSession, calculateQuizResults } from "@/lib/quiz-session"
import { getQuizById } from "@/lib/quiz-utils"
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
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)

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
        // Initialize quiz session
        const newSession = createQuizSession(resolvedParams.id, "user-id", quizData.totalQuestions, 30) // 30 minutes
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
    if (!hasAnswered) return
    setShowExplanation(true)
  }

  const handleNextQuestion = () => {
    if (!quiz) return
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleTimeUp = () => {
    handleSubmitQuiz()
  }

  const handleSubmitQuiz = async () => {
    if (!session || !quiz) return

    setIsSubmitting(true)

    // Calculate results
    const results = calculateQuizResults(session, quiz)

    // Store quiz data
    localStorage.setItem(`quiz-${resolvedParams.id}`, JSON.stringify(quiz))
    
    // Get existing attempts for this quiz
    const existingAttemptsKey = `quiz-attempts-${resolvedParams.id}`
    const existingAttempts = localStorage.getItem(existingAttemptsKey)
    let attempts = existingAttempts ? JSON.parse(existingAttempts) : []
    
    // Add current attempt with timestamp
    const newAttempt = {
      ...results,
      attemptId: Date.now().toString(),
      timestamp: new Date().toISOString()
    }
    attempts.push(newAttempt)
    
    // Store all attempts
    localStorage.setItem(existingAttemptsKey, JSON.stringify(attempts))
    
    // Find and store the best attempt (highest score)
    const bestAttempt = attempts.reduce((best: any, current: any) => 
      current.score > best.score ? current : best
    )
    localStorage.setItem(`quiz-results-${resolvedParams.id}`, JSON.stringify(bestAttempt))
    
    // Store current attempt as latest results for immediate display
    localStorage.setItem("quiz-results", JSON.stringify(results))
    
    router.push(`/quizzes/${resolvedParams.id}/results`)
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
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600">Loading quiz...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error || !quiz) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="max-w-md bg-white p-8 rounded-2xl border border-gray-100 text-center">
              <p className="text-red-600 mb-6">{error || "Quiz not found"}</p>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-3 text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Retry Loading
                </button>
                <button 
                  onClick={() => router.push("/quizzes")}
                  className="w-full px-6 py-3 text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Back to Quizzes
                </button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!session) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600">Initializing quiz session...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Quiz Header */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="mr-2 h-5 w-5" />
                  {quiz.title}
                </h1>
                <p className="text-gray-600 mt-1">{quiz.description}</p>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
                {quiz.difficulty}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <span>
                  Questions: {getAnsweredQuestions()}/{quiz.totalQuestions}
                </span>
                <span>Progress: {Math.round((getAnsweredQuestions() / quiz.totalQuestions) * 100)}%</span>
              </div>
              <QuizTimer initialTime={session.timeRemaining} onTimeUp={handleTimeUp} isPaused={isSubmitting} />
            </div>
            <Progress value={(getAnsweredQuestions() / quiz.totalQuestions) * 100} className="mt-4" />
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

          {hasAnswered && !showExplanation && (
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl">
              <div className="text-center">
                <p className="text-blue-800 mb-4">Ready to see the explanation?</p>
                <button 
                  onClick={handleSubmitAnswer} 
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors mx-auto"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Submit Answer & Show Explanation
                </button>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className={`flex items-center px-6 py-3 rounded-xl transition-colors ${
                currentQuestion === 0 
                  ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                  : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center justify-center">
              {/* Question indicators with scroll */}
              <div className="relative">
                <div className="flex space-x-1 max-w-xs sm:max-w-md md:max-w-lg overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 px-2 py-1 rounded-lg">
                  {quiz.questions.map((_, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`flex-shrink-0 w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                        index === currentQuestion
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md"
                          : session.answers[quiz.questions[index].id]
                            ? "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
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
                  onClick={() => setShowSubmitConfirm(true)} 
                  disabled={isSubmitting}
                  className={`flex items-center px-6 py-3 rounded-xl transition-colors ${
                    isSubmitting 
                      ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                      : 'text-white bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  <Flag className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Finish Quiz"}
                </button>
              ) : (
                <button 
                  disabled={!hasAnswered} 
                  className="px-6 py-3 text-gray-400 bg-gray-100 rounded-xl cursor-not-allowed"
                >
                  Submit answer first
                </button>
              )
            ) : showExplanation ? (
              <button 
                onClick={handleNextQuestion}
                className="flex items-center px-6 py-3 text-white bg-gray-900 rounded-xl hover:bg-gray-800 transition-colors"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            ) : (
              <button 
                disabled={!hasAnswered} 
                className="px-6 py-3 text-gray-400 bg-gray-100 rounded-xl cursor-not-allowed"
              >
                Submit answer first
              </button>
            )}
          </div>

          {/* Submit Confirmation */}
          {showSubmitConfirm && (
            <div className="bg-green-50 border border-green-200 p-6 rounded-2xl">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <div className="space-y-4">
                    <p className="text-green-800 font-medium">Are you sure you want to submit your quiz?</p>
                    <div className="text-sm text-green-700">
                      <p>
                        Answered: {getAnsweredQuestions()}/{quiz.totalQuestions} questions
                      </p>
                      <p>You've completed all questions with explanations.</p>
                    </div>
                    <div className="flex space-x-3">
                      <button 
                        onClick={handleSubmitQuiz} 
                        disabled={isSubmitting}
                        className={`px-6 py-3 rounded-xl transition-colors ${
                          isSubmitting 
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                            : 'text-white bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {isSubmitting ? "Submitting..." : "Yes, Submit Quiz"}
                      </button>
                      <button 
                        onClick={() => setShowSubmitConfirm(false)} 
                        disabled={isSubmitting}
                        className={`px-6 py-3 rounded-xl transition-colors ${
                          isSubmitting 
                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                            : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
