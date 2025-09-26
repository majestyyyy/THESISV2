"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Trophy, Target, RotateCcw, Home, Eye } from "lucide-react"
import { QuestionDisplay } from "@/components/quiz/question-display"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { getScoreColor, getScoreBadgeColor, formatTime } from "@/lib/quiz-session"
import type { QuizResult } from "@/lib/quiz-session"
import type { Quiz } from "@/lib/quiz-utils"

// Mock quiz data - same as take page
const mockQuiz: Quiz = {
  id: "1",
  title: "Biology Chapter 5 - Cell Structure Quiz",
  description: "Test your knowledge of cell structure and organelles",
  fileId: "1",
  fileName: "Biology Chapter 5 - Cell Structure.pdf",
  difficulty: "medium",
  totalQuestions: 5,
  createdAt: "2024-01-15",
  questions: [
    {
      id: "q1",
      questionText: "What is the powerhouse of the cell?",
      questionType: "multiple_choice",
      options: ["Nucleus", "Mitochondria", "Ribosome", "Endoplasmic Reticulum"],
      correctAnswer: "Mitochondria",
      explanation:
        "Mitochondria are known as the powerhouse of the cell because they produce ATP through cellular respiration.",
      difficulty: "easy",
    },
    {
      id: "q2",
      questionText: "The cell membrane is selectively permeable.",
      questionType: "true_false",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation:
        "The cell membrane allows some substances to pass through while blocking others, making it selectively permeable.",
      difficulty: "medium",
    },
    {
      id: "q3",
      questionText: "Explain the function of the nucleus in a cell.",
      questionType: "identification",
      correctAnswer:
        "The nucleus controls cell activities and contains the cell's DNA, which stores genetic information and regulates gene expression.",
      explanation:
        "A good answer should mention that the nucleus is the control center of the cell and contains genetic material.",
      difficulty: "medium",
    },
    {
      id: "q4",
      questionText: "Which organelle is responsible for protein synthesis?",
      questionType: "multiple_choice",
      options: ["Golgi apparatus", "Lysosomes", "Ribosomes", "Vacuoles"],
      correctAnswer: "Ribosomes",
      explanation:
        "Ribosomes are the sites of protein synthesis in the cell, where amino acids are assembled into proteins.",
      difficulty: "medium",
    },
    {
      id: "q5",
      questionText: "Plant cells have a cell wall but animal cells do not.",
      questionType: "true_false",
      options: ["True", "False"],
      correctAnswer: "True",
      explanation:
        "Plant cells have a rigid cell wall made of cellulose for structural support, while animal cells only have a flexible cell membrane.",
      difficulty: "easy",
    },
  ],
}

export default function QuizResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [results, setResults] = useState<QuizResult | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [totalAttempts, setTotalAttempts] = useState<number>(0)
  const [isShowingBestScore, setIsShowingBestScore] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>('summary')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return // Wait for hydration

    const loadResults = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Add a small delay to ensure proper client-side initialization
        await new Promise(resolve => setTimeout(resolve, 100))
        
        console.log("Loading quiz results for ID:", resolvedParams.id)
        
        // Check if we're accessing from quiz review (should show best score) or from recent completion
        const urlParams = new URLSearchParams(window.location.search)
        const showBest = urlParams.get('showBest') === 'true'
        
        // Get attempts data
        const attemptsData = localStorage.getItem(`quiz-attempts-${resolvedParams.id}`)
        const attempts = attemptsData ? JSON.parse(attemptsData) : []
        setTotalAttempts(attempts.length)
        
        let resultsToShow
        if (showBest && attempts.length > 0) {
          // Show best attempt when accessed from review
          resultsToShow = attempts.reduce((best: any, current: any) => 
            current.score > best.score ? current : best
          )
          setIsShowingBestScore(true)
        } else {
          // Show latest attempt (just completed) or fallback to best
          const latestResults = localStorage.getItem("quiz-results")
          if (latestResults) {
            resultsToShow = JSON.parse(latestResults)
          } else {
            // Fallback to best score if no latest results
            const quizSpecificResults = localStorage.getItem(`quiz-results-${resolvedParams.id}`)
            if (quizSpecificResults) {
              resultsToShow = JSON.parse(quizSpecificResults)
              setIsShowingBestScore(true)
            }
          }
        }
        
        if (resultsToShow) {
          setResults(resultsToShow)
          
          // Also try to get the quiz data from localStorage or use mock data
          const storedQuiz = localStorage.getItem(`quiz-${resolvedParams.id}`)
          if (storedQuiz) {
            setQuiz(JSON.parse(storedQuiz))
          } else {
            // Fallback to mock quiz data
            setQuiz(mockQuiz)
          }
          
          console.log("Quiz results loaded successfully:", resultsToShow)
          
        } else {
          setError("No quiz results found")
        }
        
      } catch (err) {
        console.error("Error loading quiz results:", err)
        setError("Failed to load quiz results. Please try again.")
      } finally {
        setLoading(false)
      }
    }
    
    loadResults()
  }, [router, resolvedParams.id, isHydrated])

  const getPerformanceMessage = (score: number) => {
    if (score >= 90) return "Excellent work! You have mastered this topic."
    if (score >= 80) return "Great job! You have a solid understanding."
    if (score >= 70) return "Good effort! Review the areas you missed."
    if (score >= 60) return "You're getting there! More practice will help."
    return "Keep studying! Review the material and try again."
  }

  const getPerformanceIcon = (score: number) => {
    if (score >= 80) return <Trophy className="h-8 w-8 text-yellow-500" />
    if (score >= 60) return <Target className="h-8 w-8 text-blue-500" />
    return <RotateCcw className="h-8 w-8 text-gray-500" />
  }

  if (!isHydrated || loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading quiz results...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error || !results || !quiz) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="max-w-md bg-white p-8 rounded-2xl border border-gray-100 text-center">
              <p className="text-red-600 mb-6">{error || "Results not found"}</p>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors"
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Results Header */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/50">
            <div className="text-center">
              <div className="flex justify-center mb-4">{getPerformanceIcon(results.score)}</div>
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
                {isShowingBestScore ? "Your Best Performance!" : "Quiz Complete!"}
              </h1>
              <p className="text-gray-600">{quiz.title}</p>
              {totalAttempts > 1 && (
                <div className="mt-3">
                  <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-sm rounded-full">
                    {isShowingBestScore 
                      ? `Best of ${totalAttempts} attempts` 
                      : `Attempt ${totalAttempts}`
                    }
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-1">{results.score}%</div>
                <p className="text-sm text-gray-600">
                  {isShowingBestScore ? "Best Score" : "Final Score"}
                </p>
                {isShowingBestScore && totalAttempts > 1 && (
                  <p className="text-xs text-blue-600 mt-1">🏆 Personal Best</p>
                )}
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent mb-1">
                  {results.correctAnswers}/{results.totalQuestions}
                </div>
                <p className="text-sm text-gray-600">Correct Answers</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent mb-1">{formatTime(results.timeSpent)}</div>
                <p className="text-sm text-gray-600">Time Spent</p>
              </div>
            </div>

            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-700">Overall Performance</span>
                <span className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700">
                  {results.score}%
                </span>
              </div>
              <Progress value={results.score} className="h-2 bg-gradient-to-r from-blue-100 to-blue-200" />
              <p className="text-center text-gray-600 mt-4">{getPerformanceMessage(results.score)}</p>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="w-full">
            <div className="flex space-x-1 bg-gradient-to-r from-blue-100 to-blue-200 p-1 rounded-xl mb-6">
              <button 
                onClick={() => setActiveTab('summary')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'summary' 
                    ? 'bg-white text-gray-900 shadow-sm shadow-indigo-200/50' 
                    : 'text-indigo-700 hover:text-indigo-900 hover:bg-white/50'
                }`}
              >
                Summary
              </button>
              <button 
                onClick={() => setActiveTab('review')}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === 'review' 
                    ? 'bg-white text-gray-900 shadow-sm shadow-blue-200/50' 
                    : 'text-blue-700 hover:text-blue-900 hover:bg-white/50'
                }`}
              >
                Review Answers
              </button>
            </div>

            {activeTab === 'summary' && (
              <div className="space-y-6">
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100 shadow-lg shadow-emerald-100/50">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">Performance Breakdown</h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Correct Answers</span>
                        <span className="font-medium text-emerald-600">{results.correctAnswers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Incorrect Answers</span>
                        <span className="font-medium text-red-500">
                          {results.totalQuestions - results.correctAnswers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Accuracy Rate</span>
                        <span className="font-medium bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">{results.score}%</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Time Spent</span>
                        <span className="font-medium text-gray-900">{formatTime(results.timeSpent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Average per Question</span>
                        <span className="font-medium text-gray-900">
                          {formatTime(Math.floor(results.timeSpent / results.totalQuestions))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Difficulty</span>
                        <span className="px-2 py-1 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-xs rounded-full">
                          {quiz.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-amber-100 shadow-lg shadow-amber-100/50">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent mb-4">Next Steps</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Recommendations:</h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        {results.score >= 80 ? (
                          <>
                            <li>• Excellent performance! Try a harder difficulty level</li>
                            <li>• Generate quizzes from new study materials</li>
                            <li>• Help others by sharing your study strategies</li>
                          </>
                        ) : (
                          <>
                            <li>• Review the questions you missed</li>
                            <li>• Study the source material again</li>
                            <li>• Try taking the quiz again after reviewing</li>
                          </>
                        )}
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">Study Resources:</h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Review the original file: {quiz.fileName}</li>
                        <li>• Generate a study guide from the same material</li>
                        <li>• Create flashcards for key concepts</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'review' && (
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {isShowingBestScore ? "Review Your Best Performance" : "Review Your Answers"}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {isShowingBestScore 
                      ? `Reviewing your best attempt with ${results.score}% score out of ${totalAttempts} total attempts.`
                      : `Review all ${quiz.questions.length} questions to see what you answered and learn from any mistakes.`
                    }
                  </p>
                  {isShowingBestScore && totalAttempts > 1 && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-800">
                        🏆 This shows your highest scoring attempt. Great job on achieving your personal best!
                      </p>
                    </div>
                  )}
                </div>
                
                {quiz.questions.map((question, index) => {
                  const userAnswer = results.answers[question.id]
                  return (
                    <div key={question.id} className="mb-6">
                      <QuestionDisplay
                        question={question}
                        questionNumber={index + 1}
                        totalQuestions={quiz.questions.length}
                        selectedAnswer={userAnswer?.answer || ""}
                        onAnswerChange={() => {}} // Read-only
                        showExplanation={true}
                        isCorrect={userAnswer?.isCorrect}
                      />
                    </div>
                  )
                })}
                
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-green-100 shadow-lg shadow-green-100/50">
                  <div className="text-center">
                    <h4 className="font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">Review Complete</h4>
                    <p className="text-gray-600 text-sm">
                      You answered {results.correctAnswers} out of {results.totalQuestions} questions correctly.
                      {results.score < 70 && " Consider reviewing the material and retaking the quiz to improve your understanding."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/dashboard">
              <button className="flex items-center justify-center px-6 py-3 text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </button>
            </Link>
            <Link href={`/quizzes/${resolvedParams.id}/take`}>
              <button className="flex items-center justify-center px-6 py-3 text-gray-700 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:shadow-md transition-all">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </button>
            </Link>
            <Link href="/quizzes">
              <button className="flex items-center justify-center px-6 py-3 text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200/50 transition-all">
                <Eye className="mr-2 h-4 w-4" />
                View All Quizzes
              </button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
