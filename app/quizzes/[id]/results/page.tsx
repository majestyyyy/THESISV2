"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
      questionType: "short_answer",
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

export default function QuizResultsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [results, setResults] = useState<QuizResult | null>(null)

  useEffect(() => {
    // Get results from localStorage (in real app, fetch from API)
    const storedResults = localStorage.getItem("quiz-results")
    if (storedResults) {
      setResults(JSON.parse(storedResults))
    } else {
      // Redirect if no results found
      router.push("/quizzes")
    }
  }, [router])

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

  if (!results) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex items-center justify-center min-h-96">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">{getPerformanceIcon(results.score)}</div>
              <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
              <p className="text-gray-600">{mockQuiz.title}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className={`text-3xl font-bold ${getScoreColor(results.score)}`}>{results.score}%</div>
                  <p className="text-sm text-gray-600">Final Score</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {results.correctAnswers}/{results.totalQuestions}
                  </div>
                  <p className="text-sm text-gray-600">Correct Answers</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{formatTime(results.timeSpent)}</div>
                  <p className="text-sm text-gray-600">Time Spent</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Performance</span>
                  <Badge className={getScoreBadgeColor(results.score)}>{results.score}%</Badge>
                </div>
                <Progress value={results.score} className="h-3" />
                <p className="text-center text-gray-600">{getPerformanceMessage(results.score)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Results */}
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="review">Review Answers</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Correct Answers</span>
                        <span className="font-medium text-green-600">{results.correctAnswers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Incorrect Answers</span>
                        <span className="font-medium text-red-600">
                          {results.totalQuestions - results.correctAnswers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Accuracy Rate</span>
                        <span className="font-medium">{results.score}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Time Spent</span>
                        <span className="font-medium">{formatTime(results.timeSpent)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Average per Question</span>
                        <span className="font-medium">
                          {formatTime(Math.floor(results.timeSpent / results.totalQuestions))}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Difficulty</span>
                        <Badge variant="secondary">{mockQuiz.difficulty}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Recommendations:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
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
                      <h4 className="font-medium">Study Resources:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Review the original file: {mockQuiz.fileName}</li>
                        <li>• Generate a study guide from the same material</li>
                        <li>• Create flashcards for key concepts</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="review" className="space-y-4">
              {mockQuiz.questions.map((question, index) => {
                const userAnswer = results.answers[question.id]
                return (
                  <QuestionDisplay
                    key={question.id}
                    question={question}
                    questionNumber={index + 1}
                    totalQuestions={mockQuiz.questions.length}
                    selectedAnswer={userAnswer?.answer || ""}
                    onAnswerChange={() => {}} // Read-only
                    showExplanation={true}
                    isCorrect={userAnswer?.isCorrect}
                  />
                )
              })}
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button variant="outline" className="bg-transparent">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <Link href={`/quizzes/${params.id}/take`}>
              <Button variant="outline" className="bg-transparent">
                <RotateCcw className="mr-2 h-4 w-4" />
                Retake Quiz
              </Button>
            </Link>
            <Link href="/quizzes">
              <Button>
                <Eye className="mr-2 h-4 w-4" />
                View All Quizzes
              </Button>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
