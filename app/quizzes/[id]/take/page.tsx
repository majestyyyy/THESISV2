"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChevronLeft, Flag, CheckCircle, FileText, ArrowRight } from "lucide-react"
import { QuestionDisplay } from "@/components/quiz/question-display"
import { QuizTimer } from "@/components/quiz/quiz-timer"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { createQuizSession, calculateQuizResults } from "@/lib/quiz-session"
import type { QuizSession } from "@/lib/quiz-session"
import type { Quiz } from "@/lib/quiz-utils"

// Mock quiz data with new question types - replace with actual data fetching
const mockQuiz: Quiz = {
  id: "1",
  title: "Biology Chapter 5 - Cell Structure Quiz",
  description: "Test your knowledge of cell structure and organelles",
  fileId: "1",
  fileName: "Biology Chapter 5 - Cell Structure.pdf",
  difficulty: "medium",
  totalQuestions: 7,
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
      questionText: "Identify this organelle: The control center of the cell that contains genetic material.",
      questionType: "identification",
      correctAnswer: "Nucleus",
      explanation: "The nucleus is the control center of the cell, containing DNA and regulating gene expression.",
      hints: ["It's the 'brain' of the cell", "Contains chromosomes"],
      difficulty: "medium",
    },
    {
      id: "q4",
      questionText: "Fill in the blanks: The _____ synthesizes proteins while the _____ modifies and packages them.",
      questionType: "fill_in_blanks",
      blanks: ["ribosome", "golgi apparatus"],
      correctAnswer: "ribosome, golgi apparatus",
      explanation:
        "Ribosomes are the sites of protein synthesis, while the Golgi apparatus modifies and packages proteins.",
      difficulty: "medium",
    },
    {
      id: "q5",
      questionText: "Chloroplast",
      questionType: "flashcard",
      correctAnswer: "Definition",
      flashcardBack:
        "An organelle found in plant cells that conducts photosynthesis, converting light energy into chemical energy (glucose).",
      explanation:
        "Chloroplasts are essential for photosynthesis and give plants their green color due to chlorophyll.",
      difficulty: "easy",
    },
    {
      id: "q6",
      questionText: "Which process allows plants to make their own food using sunlight?",
      questionType: "mixed",
      options: ["Cellular respiration", "Photosynthesis", "Fermentation", "Glycolysis"],
      correctAnswer: "Photosynthesis",
      explanation:
        "Photosynthesis is the process by which plants convert light energy, carbon dioxide, and water into glucose and oxygen.",
      difficulty: "medium",
    },
    {
      id: "q7",
      questionText: "Explain the function of the nucleus in a cell.",
      questionType: "short_answer",
      correctAnswer:
        "The nucleus controls cell activities and contains the cell's DNA, which stores genetic information and regulates gene expression.",
      explanation:
        "A good answer should mention that the nucleus is the control center of the cell and contains genetic material.",
      difficulty: "medium",
    },
  ],
}

export default function TakeQuizPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [session, setSession] = useState<QuizSession | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [hasAnswered, setHasAnswered] = useState(false)

  useEffect(() => {
    // Initialize quiz session
    const newSession = createQuizSession(params.id, "user-id", mockQuiz.totalQuestions, 30) // 30 minutes
    setSession(newSession)
  }, [params.id])

  useEffect(() => {
    setShowExplanation(false)
    setHasAnswered(false)
  }, [currentQuestion])

  const handleAnswerChange = (answer: string) => {
    if (!session || showExplanation) return

    const questionId = mockQuiz.questions[currentQuestion].id
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
    if (currentQuestion < mockQuiz.questions.length - 1) {
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
    if (!session) return

    setIsSubmitting(true)

    // Calculate results
    const results = calculateQuizResults(session, mockQuiz)

    // Store results and redirect
    localStorage.setItem("quiz-results", JSON.stringify(results))
    router.push(`/quizzes/${params.id}/results`)
  }

  const getAnsweredQuestions = () => {
    if (!session) return 0
    return Object.keys(session.answers).length
  }

  const isCurrentQuestionAnswered = () => {
    if (!session) return false
    const questionId = mockQuiz.questions[currentQuestion].id
    return !!session.answers[questionId]
  }

  const isCurrentAnswerCorrect = () => {
    if (!session) return false
    const questionId = mockQuiz.questions[currentQuestion].id
    const userAnswer = session.answers[questionId]
    const correctAnswer = mockQuiz.questions[currentQuestion].correctAnswer

    // Handle different question types
    const question = mockQuiz.questions[currentQuestion]
    if (question.questionType === "fill_in_blanks") {
      const userBlanks = userAnswer?.split(", ") || []
      const correctBlanks = question.blanks || []
      return (
        userBlanks.length === correctBlanks.length &&
        userBlanks.every((blank, index) => blank.toLowerCase().trim() === correctBlanks[index]?.toLowerCase().trim())
      )
    }

    return userAnswer?.toLowerCase().trim() === correctAnswer.toLowerCase().trim()
  }

  if (!session) {
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
          {/* Quiz Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    {mockQuiz.title}
                  </CardTitle>
                  <p className="text-gray-600 mt-1">{mockQuiz.description}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-800">{mockQuiz.difficulty}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <span>
                    Questions: {getAnsweredQuestions()}/{mockQuiz.totalQuestions}
                  </span>
                  <span>Progress: {Math.round((getAnsweredQuestions() / mockQuiz.totalQuestions) * 100)}%</span>
                </div>
                <QuizTimer initialTime={session.timeRemaining} onTimeUp={handleTimeUp} isPaused={isSubmitting} />
              </div>
              <Progress value={(getAnsweredQuestions() / mockQuiz.totalQuestions) * 100} className="mt-4" />
            </CardContent>
          </Card>

          {/* Question Display */}
          <QuestionDisplay
            question={mockQuiz.questions[currentQuestion]}
            questionNumber={currentQuestion + 1}
            totalQuestions={mockQuiz.totalQuestions}
            selectedAnswer={session.answers[mockQuiz.questions[currentQuestion].id] || ""}
            onAnswerChange={handleAnswerChange}
            showExplanation={showExplanation}
            isCorrect={isCurrentAnswerCorrect()}
          />

          {hasAnswered && !showExplanation && (
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-blue-800 mb-4">Ready to see the explanation?</p>
                  <Button onClick={handleSubmitAnswer} className="bg-blue-600 hover:bg-blue-700">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Submit Answer & Show Explanation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="bg-transparent"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center space-x-2">
              {/* Question indicators */}
              <div className="flex space-x-1">
                {mockQuiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded-full text-xs font-medium transition-colors ${
                      index === currentQuestion
                        ? "bg-blue-600 text-white"
                        : session.answers[mockQuiz.questions[index].id]
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {currentQuestion === mockQuiz.questions.length - 1 ? (
              showExplanation ? (
                <Button onClick={() => setShowSubmitConfirm(true)} disabled={isSubmitting}>
                  <Flag className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Submitting..." : "Finish Quiz"}
                </Button>
              ) : (
                <Button disabled={!hasAnswered} variant="outline">
                  Submit answer first
                </Button>
              )
            ) : showExplanation ? (
              <Button onClick={handleNextQuestion}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button disabled={!hasAnswered} variant="outline">
                Submit answer first
              </Button>
            )}
          </div>

          {/* Submit Confirmation */}
          {showSubmitConfirm && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <p>Are you sure you want to submit your quiz?</p>
                  <div className="text-sm text-gray-600">
                    <p>
                      Answered: {getAnsweredQuestions()}/{mockQuiz.totalQuestions} questions
                    </p>
                    <p>You've completed all questions with explanations.</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSubmitQuiz} disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Yes, Submit Quiz"}
                    </Button>
                    <Button variant="outline" onClick={() => setShowSubmitConfirm(false)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
