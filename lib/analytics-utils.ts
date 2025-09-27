// Analytics utilities and types
export interface StudySession {
  id: string
  userId: string
  activityType: "quiz" | "upload" | "review" | "generate"
  resourceId: string
  resourceName: string
  duration: number // in minutes
  score?: number
  date: string
  metadata?: Record<string, any>
}

export interface PerformanceMetrics {
  totalStudyTime: number
  averageScore: number
  quizzesTaken: number
  filesUploaded: number
  reviewersGenerated: number
  studyStreak: number
  weeklyProgress: Array<{ week: string; score: number; time: number }>
  subjectPerformance: Array<{ subject: string; averageScore: number; timeSpent: number }>
  difficultyBreakdown: Array<{ difficulty: string; count: number; averageScore: number }>
}

export interface StudyInsight {
  type: "strength" | "weakness" | "recommendation" | "achievement"
  title: string
  description: string
  actionable?: string
  icon: string
}

// Mock analytics data
export const mockStudySessions: StudySession[] = [
  {
    id: "1",
    userId: "user-1",
    activityType: "quiz",
    resourceId: "quiz-1",
    resourceName: "Biology Chapter 5 Quiz",
    duration: 15,
    score: 85,
    date: "2024-01-17",
  },
  {
    id: "2",
    userId: "user-1",
    activityType: "upload",
    resourceId: "file-1",
    resourceName: "Physics Notes.pdf",
    duration: 5,
    date: "2024-01-16",
  },
  {
    id: "3",
    userId: "user-1",
    activityType: "quiz",
    resourceId: "quiz-2",
    resourceName: "Chemistry Lab Quiz",
    duration: 12,
    score: 92,
    date: "2024-01-15",
  },
  {
    id: "4",
    userId: "user-1",
    activityType: "review",
    resourceId: "reviewer-1",
    resourceName: "Math Study Guide",
    duration: 25,
    date: "2024-01-14",
  },
  {
    id: "5",
    userId: "user-1",
    activityType: "quiz",
    resourceId: "quiz-3",
    resourceName: "History Timeline Quiz",
    duration: 18,
    score: 78,
    date: "2024-01-13",
  },
]

export const mockPerformanceMetrics: PerformanceMetrics = {
  totalStudyTime: 180, // minutes
  averageScore: 85,
  quizzesTaken: 12,
  filesUploaded: 8,
  reviewersGenerated: 5,
  studyStreak: 7,
  weeklyProgress: [
    { week: "Week 1", score: 75, time: 120 },
    { week: "Week 2", score: 82, time: 150 },
    { week: "Week 3", score: 88, time: 180 },
    { week: "Week 4", score: 85, time: 200 },
  ],
  subjectPerformance: [
    { subject: "Biology", averageScore: 88, timeSpent: 45 },
    { subject: "Chemistry", averageScore: 92, timeSpent: 38 },
    { subject: "Physics", averageScore: 82, timeSpent: 52 },
    { subject: "Mathematics", averageScore: 79, timeSpent: 35 },
    { subject: "History", averageScore: 85, timeSpent: 28 },
  ],
  difficultyBreakdown: [
    { difficulty: "Easy", count: 4, averageScore: 94 },
    { difficulty: "Medium", count: 6, averageScore: 85 },
    { difficulty: "Hard", count: 2, averageScore: 72 },
  ],
}

export function generateStudyInsights(metrics: PerformanceMetrics): StudyInsight[] {
  const insights: StudyInsight[] = []

  // Only generate insights if we have subject performance data
  if (metrics.subjectPerformance && metrics.subjectPerformance.length > 0) {
    // Strengths
    const bestSubject = metrics.subjectPerformance.reduce((best, current) =>
      current.averageScore > best.averageScore ? current : best,
    )
    insights.push({
      type: "strength",
      title: `Strong Performance in ${bestSubject.subject}`,
      description: `You're excelling in ${bestSubject.subject} with an average score of ${bestSubject.averageScore}%`,
      icon: "🎯",
    })

    // Weaknesses and recommendations
    const weakestSubject = metrics.subjectPerformance.reduce((weakest, current) =>
      current.averageScore < weakest.averageScore ? current : weakest,
    )
    if (weakestSubject.averageScore < 80) {
      insights.push({
        type: "weakness",
        title: `Focus Needed: ${weakestSubject.subject}`,
        description: `Your ${weakestSubject.subject} average is ${weakestSubject.averageScore}%. Consider additional practice.`,
        actionable: `Generate more quizzes for ${weakestSubject.subject} topics`,
        icon: "📚",
      })
    }
  }

  // Study streak achievement
  if (metrics.studyStreak >= 7) {
    insights.push({
      type: "achievement",
      title: "Week-Long Study Streak!",
      description: `You've maintained a ${metrics.studyStreak}-day study streak. Keep it up!`,
      icon: "🔥",
    })
  }

  // Study time recommendation
  if (metrics.totalStudyTime < 120) {
    insights.push({
      type: "recommendation",
      title: "Increase Study Time",
      description: "Consider spending more time studying to improve your performance.",
      actionable: "Aim for at least 30 minutes of study time per day",
      icon: "⏰",
    })
  }

  // Welcome message for new users
  if (insights.length === 0) {
    insights.push({
      type: "recommendation",
      title: "Welcome to Your Learning Journey!",
      description: "Start by uploading study materials or taking some quizzes to see your analytics here.",
      actionable: "Upload your first document or generate a quiz to get started",
      icon: "🚀",
    })
  }

  return insights
}

export function formatStudyTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours === 0) {
    return `${remainingMinutes}m`
  } else if (remainingMinutes === 0) {
    return `${hours}h`
  } else {
    return `${hours}h ${remainingMinutes}m`
  }
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
