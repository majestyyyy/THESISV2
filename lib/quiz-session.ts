// Quiz session management utilities
export interface QuizSession {
  quizId: string
  userId: string
  startTime: Date
  endTime?: Date
  currentQuestionIndex: number
  answers: Record<string, string>
  timeRemaining: number
  isCompleted: boolean
  score?: number
  totalQuestions: number
}

export interface QuizResult {
  sessionId: string
  quizId: string
  score: number
  totalQuestions: number
  correctAnswers: number
  timeSpent: number
  answers: Record<string, { answer: string; isCorrect: boolean; correctAnswer: string }>
  completedAt: Date
}

export function createQuizSession(
  quizId: string,
  userId: string,
  totalQuestions: number,
  timeLimit: number,
): QuizSession {
  return {
    quizId,
    userId,
    startTime: new Date(),
    currentQuestionIndex: 0,
    answers: {},
    timeRemaining: timeLimit * 60, // Convert minutes to seconds
    isCompleted: false,
    totalQuestions,
  }
}

export function calculateQuizResults(session: QuizSession, quiz: any): QuizResult {
  let correctAnswers = 0
  const answerDetails: Record<string, { answer: string; isCorrect: boolean; correctAnswer: string }> = {}

  quiz.questions.forEach((question: any) => {
    const userAnswer = session.answers[question.id] || ""
    let isCorrect = false

    // Handle different question types with appropriate comparison logic
    if (question.questionType === "identification") {
      // For identification questions, use case-insensitive comparison and trim whitespace
      const normalizedUserAnswer = userAnswer.toLowerCase().trim()
      const normalizedCorrectAnswer = question.correctAnswer.toLowerCase().trim()
      isCorrect = normalizedUserAnswer === normalizedCorrectAnswer
      
      // Also check for partial matches or common variations
      if (!isCorrect && normalizedCorrectAnswer.includes(' ')) {
        // Check if user answer matches any significant word in the correct answer
        const correctWords = normalizedCorrectAnswer.split(' ').filter((word: string) => word.length > 2)
        const userWords = normalizedUserAnswer.split(' ').filter((word: string) => word.length > 2)
        
        // If user provided a key word from the answer, consider it partially correct
        if (correctWords.some((word: string) => userWords.includes(word)) && userWords.length > 0) {
          isCorrect = true
        }
      }
    } else {
      // For other question types, use exact comparison
      isCorrect = userAnswer === question.correctAnswer
    }

    if (isCorrect) {
      correctAnswers++
    }

    answerDetails[question.id] = {
      answer: userAnswer,
      isCorrect,
      correctAnswer: question.correctAnswer,
    }
  })

  const score = Math.round((correctAnswers / quiz.questions.length) * 100)
  const timeSpent = Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000)

  return {
    sessionId: Math.random().toString(36).substr(2, 9),
    quizId: session.quizId,
    score,
    totalQuestions: quiz.questions.length,
    correctAnswers,
    timeSpent,
    answers: answerDetails,
    completedAt: new Date(),
  }
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600"
  if (score >= 80) return "text-blue-600"
  if (score >= 70) return "text-yellow-600"
  return "text-red-600"
}

export function getScoreBadgeColor(score: number): string {
  if (score >= 90) return "bg-green-100 text-green-800"
  if (score >= 80) return "bg-blue-100 text-blue-800"
  if (score >= 70) return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
}
