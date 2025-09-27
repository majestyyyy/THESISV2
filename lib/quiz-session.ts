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
  answers: Record<string, { 
    answer: string; 
    isCorrect: boolean; 
    correctAnswer: string;
    questionType: string;
    questionText: string;
  }>
  completedAt: Date
  questionTypeAnalysis: Record<string, { correct: number; total: number; percentage: number }>
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

// Question type detection utility
export function detectQuestionType(question: any): string {
  // First priority: Use explicit questionType if available
  if (question.questionType) {
    return question.questionType
  }
  
  // Second priority: Detect True/False questions
  if (question.options && question.options.length === 2) {
    // Check for exact True/False options (case insensitive)
    const optionsLower = question.options.map((opt: string) => opt.toLowerCase())
    if (optionsLower.includes("true") && optionsLower.includes("false")) {
      return "true_false"
    }
    
    // Check if the correct answer is exactly "True" or "False"
    if (question.correctAnswer === "True" || question.correctAnswer === "False") {
      return "true_false"
    }
  }
  
  // Third priority: Multiple choice questions (more than 2 options)
  if (question.options && question.options.length > 2) {
    return "multiple_choice"
  }
  
  // Fourth priority: Identification questions (no options)
  if (!question.options || question.options.length === 0) {
    return "identification"
  }
  
  // Fallback
  return "unknown"
}

// Question type performance analysis
export function analyzeQuestionTypePerformance(
  answers: Record<string, { answer: string; isCorrect: boolean; correctAnswer: string; questionType: string; questionText: string }>
) {
  const analysis: Record<string, { correct: number; total: number; percentage: number }> = {}
  
  // Initialize common question types
  const questionTypes = ["multiple_choice", "true_false", "identification"]
  questionTypes.forEach(type => {
    analysis[type] = { correct: 0, total: 0, percentage: 0 }
  })
  
  // Count answers by question type
  Object.values(answers).forEach(answer => {
    const questionType = answer.questionType
    if (!analysis[questionType]) {
      analysis[questionType] = { correct: 0, total: 0, percentage: 0 }
    }
    
    analysis[questionType].total++
    if (answer.isCorrect) {
      analysis[questionType].correct++
    }
  })
  
  // Calculate percentages
  Object.keys(analysis).forEach(type => {
    if (analysis[type].total > 0) {
      analysis[type].percentage = Math.round((analysis[type].correct / analysis[type].total) * 100)
    }
  })
  
  return analysis
}

export function calculateQuizResults(session: QuizSession, quiz: any): QuizResult {
  let correctAnswers = 0
  const answerDetails: Record<string, { 
    answer: string; 
    isCorrect: boolean; 
    correctAnswer: string;
    questionType: string;
    questionText: string;
  }> = {}

  quiz.questions.forEach((question: any) => {
    const userAnswer = session.answers[question.id] || ""
    let isCorrect = false
    
    // Debug: Log question details for troubleshooting
    const detectedType = detectQuestionType(question)
    console.log(`Question ${question.id}:`, {
      originalType: question.questionType,
      detectedType,
      options: question.options,
      correctAnswer: question.correctAnswer,
      questionText: question.questionText.substring(0, 50) + "..."
    })

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
      questionType: detectedType, // Use the detected type we already calculated
      questionText: question.questionText,
    }
  })

  const score = Math.round((correctAnswers / quiz.questions.length) * 100)
  const timeSpent = Math.floor((new Date().getTime() - session.startTime.getTime()) / 1000)
  const questionTypeAnalysis = analyzeQuestionTypePerformance(answerDetails)

  return {
    sessionId: Math.random().toString(36).substr(2, 9),
    quizId: session.quizId,
    score,
    totalQuestions: quiz.questions.length,
    correctAnswers,
    timeSpent,
    answers: answerDetails,
    completedAt: new Date(),
    questionTypeAnalysis,
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

// Get user's performance by question type
export function getQuestionTypePerformance(results: QuizResult) {
  return results.questionTypeAnalysis
}

// Get user's weakest question type
export function getWeakestQuestionType(results: QuizResult): string | null {
  const analysis = results.questionTypeAnalysis
  let weakestType: string | null = null
  let lowestPercentage = 100

  Object.entries(analysis).forEach(([type, stats]) => {
    if (stats.total > 0 && stats.percentage < lowestPercentage) {
      lowestPercentage = stats.percentage
      weakestType = type
    }
  })

  return weakestType
}

// Get user's strongest question type
export function getStrongestQuestionType(results: QuizResult): string | null {
  const analysis = results.questionTypeAnalysis
  let strongestType: string | null = null
  let highestPercentage = -1

  Object.entries(analysis).forEach(([type, stats]) => {
    if (stats.total > 0 && stats.percentage > highestPercentage) {
      highestPercentage = stats.percentage
      strongestType = type
    }
  })

  return strongestType
}

// Get question type display name
export function getQuestionTypeDisplayName(questionType: string): string {
  const displayNames: Record<string, string> = {
    multiple_choice: "Multiple Choice",
    true_false: "True/False",
    identification: "Identification",
    fill_in_blanks: "Fill in the Blanks",
    flashcard: "Flashcard",
    mixed: "Mixed",
    unknown: "Unknown"
  }
  
  return displayNames[questionType] || questionType
}

// Generate performance summary text
export function generatePerformanceSummary(results: QuizResult): string {
  const weakest = getWeakestQuestionType(results)
  const strongest = getStrongestQuestionType(results)
  
  let summary = `Overall Score: ${results.score}% (${results.correctAnswers}/${results.totalQuestions})`
  
  if (strongest && weakest && strongest !== weakest) {
    const strongestStats = results.questionTypeAnalysis[strongest]
    const weakestStats = results.questionTypeAnalysis[weakest]
    
    summary += `\n\nStrong: ${getQuestionTypeDisplayName(strongest)} (${strongestStats.percentage}%)`
    summary += `\nNeeds improvement: ${getQuestionTypeDisplayName(weakest)} (${weakestStats.percentage}%)`
  }
  
  return summary
}
