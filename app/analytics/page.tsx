"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Target, TrendingUp, BookOpen, Award, Activity, Brain, Zap, Eye, AlertTriangle, CheckCircle, Lightbulb, BarChart3, TrendingDown, Calendar } from "lucide-react"
import Image from "next/image"
import {
  PerformanceChart,
  SubjectPerformanceChart,
  DifficultyBreakdownChart,
} from "@/components/analytics/performance-chart"
import { StudyInsights } from "@/components/analytics/study-insights"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { generateStudyInsights, formatStudyTime, getScoreColor } from "@/lib/analytics-utils"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

const fetchAnalytics = async () => {
  try {
    const { getUserAnalytics } = await import('@/lib/analytics-data')
    return await getUserAnalytics()
  } catch (error) {
    console.error('Error fetching analytics:', error)
    throw new Error('Failed to load analytics data')
  }
}

const fetchQuizProgress = async () => {
  try {
    const { getQuizProgress } = await import('@/lib/analytics-data')
    return await getQuizProgress()
  } catch (error) {
    console.error('Error fetching quiz progress:', error)
    return []
  }
}

export default function AnalyticsPage() {
  const { data: analytics, error, isLoading, mutate } = useSWR("userAnalytics", fetchAnalytics, {
    shouldRetryOnError: false,
    revalidateOnFocus: true, // Enable revalidation on focus to pick up data changes
    onError: (err) => {
      console.error("Analytics fetch error:", err)
    },
  })

  const { data: quizProgress, error: quizError, isLoading: quizLoading } = useSWR("quizProgress", fetchQuizProgress, {
    shouldRetryOnError: false,
    revalidateOnFocus: true,
    onError: (err) => {
      console.error("Quiz progress fetch error:", err)
    },
  })

  // Convert analytics data to compatible format for insights
  const convertedMetrics = analytics ? {
    ...analytics,
    weeklyProgress: analytics.weeklyProgress.map(item => ({
      week: item.date,
      score: item.score,
      time: item.timeSpent
    })),
    subjectPerformance: analytics.subjectPerformance.map(item => ({
      subject: item.subject,
      averageScore: item.averageScore,
      timeSpent: item.timeSpent || 0
    }))
  } : {
    totalStudyTime: 0,
    averageScore: 0,
    quizzesTaken: 0,
    studyStreak: 0,
    filesUploaded: 0,
    reviewersGenerated: 0,
    weeklyProgress: [],
    difficultyBreakdown: [],
    subjectPerformance: [],
    recentActivity: []
  }

  const insights = generateStudyInsights(convertedMetrics)

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
            <p className="text-red-600">{error.message || "Failed to load analytics."}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const currentData = analytics || {
    totalStudyTime: 0,
    averageScore: 0,
    quizzesTaken: 0,
    studyStreak: 0,
    filesUploaded: 0,
    reviewersGenerated: 0,
    weeklyProgress: [],
    difficultyBreakdown: [],
    subjectPerformance: [],
    recentActivity: [],
    contentIntelligence: {
      autoDetectedTopics: [],
      fileTypePerformance: [],
      contentComplexity: {
        averageReadingLevel: 12,
        averagePageCount: 10,
        optimalLength: 'Short-form content'
      },
      aiGenerationMetrics: {
        avgQuestionsPerFile: 10,
        generationSuccessRate: 95,
        avgProcessingTime: 30
      }
    },
    knowledgeMastery: {
      conceptProgression: [],
      retentionAnalysis: {
        shortTermRetention: 85,
        mediumTermRetention: 75,
        longTermRetention: 65,
        forgettingCurve: []
      },
      learningVelocity: {
        conceptsPerHour: 2,
        improvementRate: 5,
        plateauIndicator: false
      }
    },
    studyOptimization: {
      optimalStudyTimes: [],
      sessionAnalytics: {
        optimalDuration: 45,
        breakFrequency: 1,
        focusScore: 75
      },
      learningPatterns: {
        preferredDifficulty: 'Medium',
        learningStyle: 'Mixed',
        strengths: [],
        improvementAreas: []
      },
      recommendations: []
    },
    machineLearning: {
      performancePrediction: {
        nextQuizScorePrediction: 85,
        confidenceInterval: { min: 70, max: 90 },
        predictionAccuracy: 85,
        improvementTrajectory: 'stable' as const
      },
      adaptiveLearning: {
        recommendedDifficulty: 'Medium',
        difficultyAdjustmentReason: 'Moderate performance suggests maintaining current difficulty',
        learningPathOptimization: [],
        personalizedQuestionTypes: []
      },
      intelligentInsights: {
        learningPatternAnalysis: {
          dominantPattern: 'Consistent Learner',
          patternStrength: 75,
          behavioralTrends: []
        },
        anomalyDetection: [],
        predictiveAlerts: []
      },
      comparativeAnalytics: {
        percentileRanking: 75,
        similarLearnerComparison: {
          averageImprovement: 12,
          yourImprovement: 0,
          relativePerfomance: 'average' as const
        },
        benchmarkMetrics: []
      }
    },
    advancedVisualizations: {
      heatmaps: {
        studyTimeHeatmap: [],
        performanceHeatmap: [],
        topicMasteryHeatmap: []
      },
      trendAnalysis: {
        performanceTrends: [],
        learningCurves: [],
        velocityAnalysis: []
      },
      interactiveMetrics: {
        drillDownData: [],
        correlationMatrix: [],
        dimensionalAnalysis: []
      }
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Enhanced Header */}
          <div className="relative bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-blue-100 shadow-lg shadow-blue-100/50">
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center space-x-2 sm:space-x-3">
              <Button
                onClick={() => mutate()}
                variant="outline"
                size="sm"
                className="bg-white/80 hover:bg-white text-xs sm:text-sm px-2 sm:px-3"
                disabled={isLoading}
              >
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </Button>
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-white" />
              </div>
            </div>
            <div className="max-w-xl sm:max-w-2xl pr-16 sm:pr-20">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2 sm:mb-4">
                Learning Analytics
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
                Track your progress, discover insights about your learning patterns, and unlock your full potential with AI-powered analytics.
              </p>
            </div>
          </div>

          {/* Enhanced Key Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-6 lg:grid-cols-4">
            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Total Study Time</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                  {formatStudyTime(currentData.totalStudyTime)}
                </p>
                <p className="text-xs text-blue-600 mt-1 font-medium">+12% this week</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-green-100 shadow-lg shadow-green-100/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg sm:rounded-xl">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-green-600" />
                </div>
                <div className="text-right">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Average Score</p>
                <p className={`text-lg sm:text-xl lg:text-2xl font-bold ${getScoreColor(currentData.averageScore)}`}>
                  {currentData.averageScore}%
                </p>
                <p className="text-xs text-green-600 mt-1 font-medium">+5% from last month</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-purple-100 shadow-lg shadow-purple-100/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg sm:rounded-xl">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-purple-600" />
                </div>
                <div className="text-right">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Quizzes Taken</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{currentData.quizzesTaken}</p>
                <p className="text-xs text-purple-600 mt-1 font-medium">3 this week</p>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl border border-orange-100 shadow-lg shadow-orange-100/50 hover:shadow-xl transition-all duration-300 col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg sm:rounded-xl">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-orange-600" />
                </div>
                <div className="text-right">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-orange-500 rounded-full animate-pulse"></div>
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Study Streak</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{currentData.studyStreak} days</p>
                <p className="text-xs text-orange-600 mt-1 font-medium">Keep it up! 🔥</p>
              </div>
            </div>
          </div>

          {/* Enhanced Detailed Analytics */}
          <Tabs defaultValue="overview" className="w-full">
            <div className="flex items-center justify-center mb-4 sm:mb-6 lg:mb-8 px-2">
              <TabsList className="grid w-full max-w-full sm:max-w-4xl grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg shadow-blue-100/50 rounded-xl sm:rounded-2xl p-1 gap-1 sm:gap-0">
                <TabsTrigger 
                  value="overview" 
                  className="rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm p-2 sm:p-3"
                >
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Overview</span>
                  <span className="sm:hidden">Home</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="performance"
                  className="rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm p-2 sm:p-3"
                >
                  <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Performance</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="ai-insights"
                  className="rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm p-2 sm:p-3 col-span-2 sm:col-span-1"
                >
                  <Brain className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden lg:inline">AI Insights</span>
                  <span className="lg:hidden">AI</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="quiz-progress"
                  className="rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm p-2 sm:p-3"
                >
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Quiz Progress</span>
                  <span className="sm:hidden">Quiz</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="recommendations"
                  className="rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm p-2 sm:p-3"
                >
                  <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden lg:inline">Study Tips</span>
                  <span className="lg:hidden">Tips</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full overflow-hidden">
                <div className="min-w-0">
                  <PerformanceChart data={convertedMetrics.weeklyProgress} type="line" />
                </div>
                <div className="min-w-0">
                  <DifficultyBreakdownChart data={currentData.difficultyBreakdown} />
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
                  <div className="mb-3 sm:mb-0">
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Recent Activity Summary</h3>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">Your learning activity over the past week</p>
                  </div>
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl self-start sm:self-center">
                    <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl sm:rounded-2xl border border-indigo-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                      <Image src="/LOGO.png" alt="AI-GiR Logo" width={24} height={24} className="filter brightness-0 invert w-4 h-4 sm:w-6 sm:h-6" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-indigo-900 mb-2">{currentData.filesUploaded}</p>
                    <p className="text-xs sm:text-sm font-medium text-indigo-700">Files Uploaded</p>
                    <div className="mt-2 sm:mt-3 w-full bg-indigo-200 rounded-full h-1.5 sm:h-2">
                      <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-1.5 sm:h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl border border-green-200 hover:shadow-lg transition-all duration-300">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                      <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-green-900 mb-2">{currentData.reviewersGenerated}</p>
                    <p className="text-xs sm:text-sm font-medium text-green-700">Study Guides Created</p>
                    <div className="mt-2 sm:mt-3 w-full bg-green-200 rounded-full h-1.5 sm:h-2">
                      <div className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 sm:h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                  <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl sm:rounded-2xl border border-yellow-200 hover:shadow-lg transition-all duration-300 sm:col-span-2 lg:col-span-1">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                      <Award className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-900 mb-2">
                      {currentData.difficultyBreakdown.reduce((acc, item) => acc + item.count, 0)}
                    </p>
                    <p className="text-xs sm:text-sm font-medium text-yellow-700">Completed Quiz</p>
                    <div className="mt-2 sm:mt-3 w-full bg-yellow-200 rounded-full h-1.5 sm:h-2">
                      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-1.5 sm:h-2 rounded-full" style={{ width: '90%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 w-full overflow-hidden">
                <div className="min-w-0">
                  <PerformanceChart data={convertedMetrics.weeklyProgress} type="bar" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-green-100 shadow-lg shadow-green-100/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
                    <div className="mb-3 sm:mb-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Performance Trends</h3>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">Analysis of your learning progress</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-lg sm:rounded-xl self-start sm:self-center">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg sm:rounded-xl hover:shadow-md transition-all duration-300">
                      <div className="mb-2 sm:mb-0">
                        <p className="font-semibold text-gray-900 text-sm sm:text-base">Score Improvement</p>
                        <p className="text-xs sm:text-sm text-gray-600">Last 4 weeks</p>
                      </div>
                      <div className="flex items-center bg-white/80 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg shadow-sm self-start sm:self-center">
                        <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1 sm:mr-2" />
                        <span className="text-green-600 font-bold text-base sm:text-lg">+13%</span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg sm:rounded-xl hover:shadow-md transition-all duration-300">
                      <div>
                        <p className="font-semibold text-gray-900">Study Time Increase</p>
                        <p className="text-sm text-gray-600">Compared to last month</p>
                      </div>
                      <div className="flex items-center bg-white/80 px-3 py-2 rounded-lg shadow-sm">
                        <TrendingUp className="h-4 w-4 text-blue-600 mr-2" />
                        <span className="text-blue-600 font-bold text-lg">+67%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-xl hover:shadow-md transition-all duration-300">
                      <div>
                        <p className="font-semibold text-gray-900">Consistency Score</p>
                        <p className="text-sm text-gray-600">Daily study habit</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg shadow-sm font-semibold">
                        Excellent
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Difficulty Progression</h3>
                    <p className="text-gray-600 text-sm mt-1">Your performance across different difficulty levels</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <div className="space-y-4">
                  {currentData.difficultyBreakdown.map((item) => (
                    <div 
                      key={item.difficulty} 
                      className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-md ${
                        item.difficulty === "Easy"
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300"
                          : item.difficulty === "Medium"
                            ? "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 hover:border-yellow-300"
                            : "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 hover:border-red-300"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <Badge
                          className={`px-4 py-2 rounded-xl font-semibold shadow-sm ${
                            item.difficulty === "Easy"
                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white"
                              : item.difficulty === "Medium"
                                ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white"
                                : "bg-gradient-to-r from-red-500 to-red-600 text-white"
                          }`}
                        >
                          {item.difficulty}
                        </Badge>
                        <div>
                          <p className="font-semibold text-gray-900">{item.count} quizzes completed</p>
                          <p className="text-sm text-gray-600">Average score: {item.averageScore}%</p>
                        </div>
                      </div>
                      <div className="text-right bg-white/80 px-4 py-2 rounded-xl shadow-sm">
                        <p className={`text-2xl font-bold ${getScoreColor(item.averageScore)}`}>
                          {item.averageScore}%
                        </p>
                        <div className="w-16 bg-gray-200 rounded-full h-2 mt-2">
                          <div 
                            className={`h-2 rounded-full ${
                              item.difficulty === "Easy" ? "bg-gradient-to-r from-green-500 to-green-600" :
                              item.difficulty === "Medium" ? "bg-gradient-to-r from-yellow-500 to-yellow-600" :
                              "bg-gradient-to-r from-red-500 to-red-600"
                            }`}
                            style={{ width: `${item.averageScore}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-4 sm:space-y-6 lg:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-purple-100 shadow-lg shadow-purple-100/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6">
                    <div className="mb-3 sm:mb-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900">Content Intelligence</h3>
                      <p className="text-gray-600 text-xs sm:text-sm mt-1">AI-powered analysis of your study materials</p>
                    </div>
                    <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg sm:rounded-xl self-start sm:self-center">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">Auto-Detected Topics</h4>
                      <div className="space-y-2">
                        {['Mathematics', 'Science', 'Computer Science', 'Statistics'].map((topic, index) => (
                          <div key={topic} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-lg sm:rounded-xl border border-purple-200">
                            <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-0">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs sm:text-sm font-bold">{topic.charAt(0)}</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 text-sm sm:text-base">{topic}</p>
                                <p className="text-xs text-gray-600">Confidence: {90 - index * 10}%</p>
                              </div>
                            </div>
                            <div className="text-left sm:text-right">
                              <p className="text-xs sm:text-sm font-semibold text-purple-600">{85 - index * 5}% mastery</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">File Type Performance</h4>
                      <div className="space-y-3">
                        {[
                          { type: 'PDF', score: 88, count: 3 },
                          { type: 'TXT', score: 82, count: 2 },
                          { type: 'DOCX', score: 90, count: 1 }
                        ].map(fileType => (
                          <div key={fileType.type} className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white text-xs font-bold">{fileType.type}</span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{fileType.type} Files</p>
                                <p className="text-xs text-gray-600">{fileType.count} files processed</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-blue-600">{fileType.score}% avg score</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-green-100 shadow-lg shadow-green-100/50">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">AI Generation Metrics</h3>
                      <p className="text-gray-600 text-sm mt-1">How effectively AI processes your content</p>
                    </div>
                    <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                        <p className="text-2xl font-bold text-green-700">9</p>
                        <p className="text-sm text-green-600">Avg Questions/File</p>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                        <p className="text-2xl font-bold text-blue-700">95%</p>
                        <p className="text-sm text-blue-600">Success Rate</p>
                      </div>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                      <p className="text-2xl font-bold text-purple-700">45s</p>
                      <p className="text-sm text-purple-600">Avg Processing Time</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Content Complexity Analysis</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Reading Level</span>
                          <span className="font-semibold text-gray-900">Grade 12</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Avg Page Count</span>
                          <span className="font-semibold text-gray-900">18 pages</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700">Optimal Length</span>
                          <span className="font-semibold text-gray-900">15-25 pages</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="w-full min-w-0 overflow-hidden">
                <SubjectPerformanceChart data={convertedMetrics.subjectPerformance} />
              </div>

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 shadow-lg shadow-purple-100/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Subject Analysis</h3>
                    <p className="text-gray-600 text-sm mt-1">Detailed breakdown of your performance by subject</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                    <BookOpen className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <div className="space-y-4">
                  {convertedMetrics.subjectPerformance.map((subject, index) => (
                    <div 
                      key={subject.subject} 
                      className={`flex items-center justify-between p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-md ${
                        index % 2 === 0 
                          ? "bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 hover:border-purple-300"
                          : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                          index % 2 === 0
                            ? "bg-gradient-to-br from-purple-500 to-purple-600"
                            : "bg-gradient-to-br from-blue-500 to-blue-600"
                        }`}>
                          <BookOpen className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{subject.subject}</p>
                          <p className="text-sm text-gray-600 font-medium">{formatStudyTime(subject.timeSpent)} studied</p>
                          <div className="mt-2 w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                index % 2 === 0
                                  ? "bg-gradient-to-r from-purple-500 to-purple-600"
                                  : "bg-gradient-to-r from-blue-500 to-blue-600"
                              }`}
                              style={{ width: `${subject.averageScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right bg-white/80 px-4 py-3 rounded-xl shadow-sm">
                        <p className={`text-2xl font-bold ${getScoreColor(subject.averageScore)}`}>
                          {subject.averageScore}%
                        </p>
                        <p className="text-xs text-gray-500 font-medium">Average Score</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mastery" className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-100/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Knowledge Mastery</h3>
                    <p className="text-gray-600 text-sm mt-1">Track your understanding and retention across topics</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl">
                    <TrendingUp className="h-5 w-5 text-indigo-600" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="p-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Target className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="font-bold text-purple-900 mb-2">Concept Mastery</h4>
                      <p className="text-3xl font-bold text-purple-700 mb-2">78%</p>
                      <p className="text-sm text-purple-600">Average across all topics</p>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Clock className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="font-bold text-blue-900 mb-2">Retention Rate</h4>
                      <p className="text-3xl font-bold text-blue-700 mb-2">82%</p>
                      <p className="text-sm text-blue-600">30-day knowledge retention</p>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="h-8 w-8 text-white" />
                      </div>
                      <h4 className="font-bold text-green-900 mb-2">Learning Velocity</h4>
                      <p className="text-3xl font-bold text-green-700 mb-2">+15%</p>
                      <p className="text-sm text-green-600">Improvement rate this month</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 space-y-4">
                  <h4 className="text-lg font-bold text-gray-900">Concept Progression</h4>
                  <div className="space-y-3">
                    {['Mathematics', 'Science', 'General'].map((concept, index) => (
                      <div key={concept} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            index === 0 ? 'bg-gradient-to-br from-blue-500 to-blue-600' :
                            index === 1 ? 'bg-gradient-to-br from-green-500 to-green-600' :
                            'bg-gradient-to-br from-purple-500 to-purple-600'
                          }`}>
                            <BookOpen className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{concept}</p>
                            <p className="text-sm text-gray-600">Mastery Level: {index === 0 ? '85%' : index === 1 ? '78%' : '72%'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Confidence Score</p>
                          <p className="text-lg font-bold text-gray-900">{index === 0 ? '92%' : index === 1 ? '85%' : '80%'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="optimization" className="space-y-8">
              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-teal-100 shadow-lg shadow-teal-100/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Study Optimization</h3>
                    <p className="text-gray-600 text-sm mt-1">Personalized recommendations to improve your learning</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl">
                    <Activity className="h-5 w-5 text-teal-600" />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl">
                      <h4 className="font-bold text-blue-900 mb-4 text-lg">Optimal Study Times</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-800">Morning (9-11 AM)</span>
                          <span className="text-blue-600 font-semibold">92% performance</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-800">Afternoon (2-4 PM)</span>
                          <span className="text-blue-600 font-semibold">87% performance</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '87%' }}></div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-800">Evening (6-8 PM)</span>
                          <span className="text-blue-600 font-semibold">75% performance</span>
                        </div>
                        <div className="w-full bg-blue-200 rounded-full h-2">
                          <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl">
                      <h4 className="font-bold text-green-900 mb-4 text-lg">Session Analytics</h4>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-green-800">Optimal Duration</span>
                          <span className="text-green-600 font-semibold">45 minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-800">Recommended Breaks</span>
                          <span className="text-green-600 font-semibold">Every 15 minutes</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-800">Focus Score</span>
                          <span className="text-green-600 font-semibold">85%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-violet-50 border-2 border-purple-200 rounded-2xl">
                      <h4 className="font-bold text-purple-900 mb-4 text-lg">Learning Patterns</h4>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-purple-800">Preferred Difficulty</span>
                            <span className="text-purple-600 font-semibold">Medium</span>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-purple-800">Learning Style</span>
                            <span className="text-purple-600 font-semibold">Visual-Analytical</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-purple-800 font-medium mb-2">Strengths:</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-green-100 text-green-800">Problem Solving</Badge>
                            <Badge className="bg-green-100 text-green-800">Pattern Recognition</Badge>
                            <Badge className="bg-green-100 text-green-800">Analytical Thinking</Badge>
                          </div>
                        </div>
                        <div>
                          <p className="text-purple-800 font-medium mb-2">Improvement Areas:</p>
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-orange-100 text-orange-800">Time Management</Badge>
                            <Badge className="bg-orange-100 text-orange-800">Advanced Concepts</Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl">
                      <h4 className="font-bold text-yellow-900 mb-4 text-lg">AI Recommendations</h4>
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                          <p className="text-yellow-800 text-sm">Try more challenging quizzes to accelerate growth</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                          <p className="text-yellow-800 text-sm">Review concepts from 3 days ago for better retention</p>
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                          <p className="text-yellow-800 text-sm">Schedule your next study session for 9 AM tomorrow</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-8">
              <StudyInsights insights={insights} />

              <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-orange-100 shadow-lg shadow-orange-100/50">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Study Recommendations</h3>
                    <p className="text-gray-600 text-sm mt-1">Personalized suggestions to improve your learning</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
                    <Award className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-blue-900 mb-2 text-lg">Optimal Study Time</h4>
                        <p className="text-sm text-blue-800 leading-relaxed">
                          Based on your performance data, you tend to score higher on quizzes taken between 2-4 PM.
                          Consider scheduling your most challenging study sessions during this time.
                        </p>
                        <div className="mt-3 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span className="text-xs text-blue-700 font-medium">Peak Performance Window: 2-4 PM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                        <TrendingUp className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-green-900 mb-2 text-lg">Study Pattern Success</h4>
                        <p className="text-sm text-green-800 leading-relaxed">
                          Your consistent daily study habit is paying off! Students with similar patterns show 23% better
                          long-term retention.
                        </p>
                        <div className="mt-3 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-xs text-green-700 font-medium">Consistency Streak: {currentData.studyStreak} days</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-yellow-900 mb-2 text-lg">Difficulty Progression</h4>
                        <p className="text-sm text-yellow-800 leading-relaxed">
                          You're ready to tackle more hard-level quizzes. Your medium-level performance suggests you can
                          handle the increased challenge.
                        </p>
                        <div className="mt-3 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span className="text-xs text-yellow-700 font-medium">Ready for: Hard Level Challenges</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* AI Insights Tab - Consolidated ML Features */}
            <TabsContent value="ai-insights" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Performance Prediction */}
                <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-pink-200 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-pink-900">Score Estimate</CardTitle>
                        <CardDescription className="text-pink-700">Based on your recent performance</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-pink-900 mb-2">
                        {Math.round(currentData.machineLearning?.performancePrediction?.nextQuizScorePrediction || 85)}%
                      </div>
                      <p className="text-sm text-pink-700">Estimated next quiz score</p>
                      <div className="mt-3 flex items-center justify-center space-x-4 text-sm">
                        <span className="text-pink-600">
                          Range: {Math.round(currentData.machineLearning?.performancePrediction?.confidenceInterval?.min || 70)}% - {Math.round(currentData.machineLearning?.performancePrediction?.confidenceInterval?.max || 90)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-pink-700">Based on Recent Scores</span>
                        <span className="font-medium text-pink-900">Last 3 quizzes</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={currentData.machineLearning?.performancePrediction?.improvementTrajectory === 'ascending' ? 'default' : 
                                     currentData.machineLearning?.performancePrediction?.improvementTrajectory === 'stable' ? 'secondary' : 'destructive'}>
                        {currentData.machineLearning?.performancePrediction?.improvementTrajectory === 'ascending' && <TrendingUp className="h-3 w-3 mr-1" />}
                        {currentData.machineLearning?.performancePrediction?.improvementTrajectory === 'declining' && <TrendingDown className="h-3 w-3 mr-1" />}
                        {currentData.machineLearning?.performancePrediction?.improvementTrajectory || 'Stable'} Trajectory
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Comparative Analytics */}
                <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-blue-900">Comparative Analytics</CardTitle>
                        <CardDescription className="text-blue-700">How you compare to similar learners</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-900 mb-2">
                        {Math.round(currentData.machineLearning?.comparativeAnalytics?.percentileRanking || 75)}th
                      </div>
                      <p className="text-sm text-blue-700">Percentile ranking</p>
                    </div>
                    <div className="space-y-3">
                      {(currentData.machineLearning?.comparativeAnalytics?.benchmarkMetrics || [
                        { metric: 'Average Score', yourValue: 85, benchmarkValue: 75, percentileDifference: 13 },
                        { metric: 'Study Time', yourValue: 120, benchmarkValue: 180, percentileDifference: -33 },
                        { metric: 'Quizzes Completed', yourValue: 5, benchmarkValue: 8, percentileDifference: -38 }
                      ]).map((metric, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-blue-700">{metric.metric}</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-blue-900">{metric.yourValue}</span>
                            <Badge variant={metric.percentileDifference > 0 ? 'default' : 'secondary'}>
                              {metric.percentileDifference > 0 ? '+' : ''}{Math.round(metric.percentileDifference)}%
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Anomaly Detection */}
              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-yellow-900">Intelligent Anomaly Detection</CardTitle>
                      <CardDescription className="text-yellow-700">AI-detected patterns and unusual behaviors</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(currentData.machineLearning?.intelligentInsights?.anomalyDetection || []).length > 0 ? (
                      currentData.machineLearning.intelligentInsights.anomalyDetection.map((anomaly, index) => (
                        <Alert key={index} className={`${
                          anomaly.severity === 'high' ? 'border-red-200 bg-red-50' :
                          anomaly.severity === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                          'border-blue-200 bg-blue-50'
                        }`}>
                          <AlertTriangle className={`h-4 w-4 ${
                            anomaly.severity === 'high' ? 'text-red-600' :
                            anomaly.severity === 'medium' ? 'text-yellow-600' :
                            'text-blue-600'
                          }`} />
                          <AlertDescription>
                            <div className="space-y-2">
                              <div className="font-medium">{anomaly.description}</div>
                              <div className="text-sm opacity-80">{anomaly.recommendation}</div>
                              <Badge variant={
                                anomaly.severity === 'high' ? 'destructive' :
                                anomaly.severity === 'medium' ? 'default' : 'secondary'
                              }>
                                {anomaly.severity} priority
                              </Badge>
                            </div>
                          </AlertDescription>
                        </Alert>
                      ))
                    ) : (
                      <Alert className="border-green-200 bg-green-50">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription>
                          <div className="text-green-800">
                            <div className="font-medium">All systems normal</div>
                            <div className="text-sm">No unusual patterns detected in your learning behavior</div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Study Tips Tab - Consolidated Recommendations */}
            <TabsContent value="recommendations" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Learning Path Optimization */}
                <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-violet-500 to-violet-600 rounded-lg">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-violet-900">Optimized Learning Path</CardTitle>
                        <CardDescription className="text-violet-700">AI-recommended study sequence</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(currentData.machineLearning?.adaptiveLearning?.learningPathOptimization || [
                        { step: 1, topic: 'Mathematics', estimatedDuration: 45, priority: 85 },
                        { step: 2, topic: 'Science', estimatedDuration: 50, priority: 75 },
                        { step: 3, topic: 'Literature', estimatedDuration: 35, priority: 65 }
                      ]).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/80 rounded-xl border border-violet-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-violet-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                              {item.step}
                            </div>
                            <div>
                              <div className="font-medium text-violet-900">{item.topic}</div>
                              <div className="text-sm text-violet-600">{item.estimatedDuration} min estimated</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">Priority: {item.priority}/100</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Personalized Question Types */}
                <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-teal-900">Optimal Question Types</CardTitle>
                        <CardDescription className="text-teal-700">Best formats for your learning style</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(currentData.machineLearning?.adaptiveLearning?.personalizedQuestionTypes || [
                        { type: 'Short Answer', effectiveness: 90, recommendationScore: 95 },
                        { type: 'Multiple Choice', effectiveness: 85, recommendationScore: 90 },
                        { type: 'True/False', effectiveness: 75, recommendationScore: 80 },
                        { type: 'Essay', effectiveness: 50, recommendationScore: 40 }
                      ]).map((questionType, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-teal-900">{questionType.type}</span>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-teal-700">{questionType.effectiveness}% effective</span>
                              <Badge variant={questionType.recommendationScore > 80 ? 'default' : 'secondary'}>
                                {questionType.recommendationScore > 80 ? 'Recommended' : 'Optional'}
                              </Badge>
                            </div>
                          </div>
                          <Progress value={questionType.effectiveness} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Adaptive Recommendations */}
              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                      <Brain className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-emerald-900">AI Adaptive Recommendations</CardTitle>
                      <CardDescription className="text-emerald-700">Personalized suggestions based on your learning patterns</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/80 rounded-xl border border-emerald-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <Target className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-emerald-900">Recommended Difficulty</span>
                      </div>
                      <div className="text-2xl font-bold text-emerald-900 mb-1">
                        {currentData.machineLearning?.adaptiveLearning?.recommendedDifficulty || 'Medium'}
                      </div>
                      <p className="text-sm text-emerald-700">
                        {currentData.machineLearning?.adaptiveLearning?.difficultyAdjustmentReason || 
                         'Moderate performance suggests maintaining current difficulty with gradual increases'}
                      </p>
                    </div>
                    
                    <div className="p-4 bg-white/80 rounded-xl border border-emerald-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <Activity className="h-4 w-4 text-emerald-600" />
                        <span className="font-medium text-emerald-900">Learning Pattern</span>
                      </div>
                      <div className="text-2xl font-bold text-emerald-900 mb-1">
                        {currentData.machineLearning?.intelligentInsights?.learningPatternAnalysis?.dominantPattern || 'Consistent Learner'}
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-emerald-700">Pattern Strength:</span>
                        <Progress 
                          value={currentData.machineLearning?.intelligentInsights?.learningPatternAnalysis?.patternStrength || 75} 
                          className="flex-1 h-2" 
                        />
                        <span className="text-sm font-medium text-emerald-900">
                          {Math.round(currentData.machineLearning?.intelligentInsights?.learningPatternAnalysis?.patternStrength || 75)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Quiz Progress Tab - Individual Quiz Tracking */}
            <TabsContent value="quiz-progress" className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                {/* Generated Quizzes with Attempts */}
                <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-indigo-900">Generated Quiz Performance</CardTitle>
                          <CardDescription className="text-indigo-700">Progress tracking for each generated quiz</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Individual Quiz Progress */}
                      {quizLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                          <p className="ml-3 text-indigo-600">Loading quiz progress...</p>
                        </div>
                      ) : quizProgress && quizProgress.length > 0 ? (
                        quizProgress.map((quiz) => (
                        <div key={quiz.id} className="p-6 bg-white/80 rounded-xl border border-indigo-100 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="font-semibold text-indigo-900 text-lg">{quiz.title}</h4>
                              <p className="text-sm text-indigo-600">{quiz.totalQuestions} questions • {quiz.difficulty}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={quiz.difficulty === 'Easy' ? 'secondary' : quiz.difficulty === 'Medium' ? 'default' : 'destructive'}>
                                {quiz.difficulty}
                              </Badge>
                              <Badge variant="outline">
                                {quiz.totalAttempts} attempt{quiz.totalAttempts > 1 ? 's' : ''}
                              </Badge>
                            </div>
                          </div>

                          {/* Attempts List */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="space-y-2">
                              <h5 className="font-medium text-indigo-800 text-sm">Attempt History</h5>
                              {quiz.attempts.map((attempt, index) => (
                                <div key={index} className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-indigo-600">Attempt {index + 1}</span>
                                    <span className="text-xs text-indigo-500">
                                      {new Date(attempt.completedAt).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="text-center">
                                      <div className="font-medium text-indigo-900">{attempt.score}/{attempt.totalQuestions}</div>
                                      <div className="text-indigo-600">Correct</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-medium text-indigo-900">{attempt.percentage}%</div>
                                      <div className="text-indigo-600">Score</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="font-medium text-indigo-900">{Math.floor(attempt.timeSpent / 60)}m {attempt.timeSpent % 60}s</div>
                                      <div className="text-indigo-600">Time</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            
                            <div className="space-y-3">
                              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                <div className={`text-3xl font-bold ${
                                  quiz.averageScore >= 90 ? 'text-green-600' : 
                                  quiz.averageScore >= 70 ? 'text-blue-600' : 
                                  'text-red-600'
                                }`}>
                                  {quiz.averageScore}%
                                </div>
                                <div className="text-sm text-indigo-600">Average Score</div>
                              </div>
                              
                              <div className="text-center p-3 bg-green-50/80 rounded-lg">
                                <div className="text-lg font-semibold text-green-900">
                                  {quiz.bestScore}/{quiz.totalQuestions}
                                </div>
                                <div className="text-xs text-green-600">
                                  Best Score
                                </div>
                              </div>
                              
                              <div className="text-center p-3 bg-indigo-50/80 rounded-lg">
                                <div className="text-lg font-semibold text-indigo-900">
                                  {quiz.totalAttempts}
                                </div>
                                <div className="text-xs text-indigo-600">
                                  Total Attempt{quiz.totalAttempts > 1 ? 's' : ''}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Interpretation Message */}
                          <div className={`p-3 rounded-lg border-l-4 ${
                            quiz.averageScore >= 90 ? 'bg-green-50 border-green-400' :
                            quiz.averageScore >= 70 ? 'bg-blue-50 border-blue-400' :
                            'bg-yellow-50 border-yellow-400'
                          }`}>
                            <p className={`text-sm ${
                              quiz.averageScore >= 90 ? 'text-green-800' :
                              quiz.averageScore >= 70 ? 'text-blue-800' :
                              'text-yellow-800'
                            }`}>
                              <strong>Insight:</strong> {quiz.interpretation}
                            </p>
                          </div>
                        </div>
                      ))
                      ) : (
                        <div className="text-center py-8">
                          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-lg font-medium text-gray-600">No quizzes found</p>
                          <p className="text-sm text-gray-500 mt-1">Upload a file and generate a quiz to see your progress here!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Quiz Progress Summary */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-green-900 flex items-center space-x-2">
                        <BookOpen className="h-5 w-5" />
                        <span>Total Quizzes</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        {quizProgress && quizProgress.length > 0 ? (
                          <>
                            <div className="text-3xl font-bold text-green-600 mb-2">
                              {quizProgress.length}
                            </div>
                            <p className="text-sm text-green-700">
                              Quizzes Generated
                            </p>
                            <p className="text-xs text-green-600 mt-1">
                              {quizProgress.reduce((sum, q) => sum + q.totalAttempts, 0)} total attempts
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl font-bold text-gray-400 mb-2">0</div>
                            <p className="text-sm text-gray-500">No quizzes yet</p>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-blue-900 flex items-center space-x-2">
                        <BarChart3 className="h-5 w-5" />
                        <span>Overall Average</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        {quizProgress && quizProgress.length > 0 ? (
                          <>
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                              {Math.round(quizProgress.reduce((sum, q) => sum + q.averageScore, 0) / quizProgress.length)}%
                            </div>
                            <p className="text-sm text-blue-700">All quiz attempts</p>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl font-bold text-gray-400 mb-2">--</div>
                            <p className="text-sm text-gray-500">No quizzes yet</p>
                          </>
                        )}
                        <div className="flex items-center justify-center mt-2">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-xs text-green-600">Improving trend</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-purple-900 flex items-center space-x-2">
                        <Activity className="h-5 w-5" />
                        <span>Total Attempts</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        {quizProgress && quizProgress.length > 0 ? (
                          <>
                            <div className="text-3xl font-bold text-purple-600 mb-2">
                              {quizProgress.reduce((sum, q) => sum + q.totalAttempts, 0)}
                            </div>
                            <p className="text-sm text-purple-700">
                              Across {quizProgress.length} quiz{quizProgress.length > 1 ? 'es' : ''}
                            </p>
                            <p className="text-xs text-purple-600 mt-1">
                              {Math.round(quizProgress.reduce((sum, q) => sum + q.totalAttempts, 0) / quizProgress.length)} attempts per quiz avg.
                            </p>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl font-bold text-gray-400 mb-2">0</div>
                            <p className="text-sm text-gray-500">No attempts yet</p>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-amber-900 flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>Needs Practice</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center">
                        {quizProgress && quizProgress.length > 0 ? (
                          <>
                            <div className="text-3xl font-bold text-amber-600 mb-2">
                              {Math.min(...quizProgress.map(q => q.averageScore))}%
                            </div>
                            <p className="text-sm text-amber-700">
                              {quizProgress.find(q => q.averageScore === Math.min(...quizProgress.map(quiz => quiz.averageScore)))?.title}
                            </p>
                            <p className="text-xs text-amber-600 mt-1">Focus area</p>
                          </>
                        ) : (
                          <>
                            <div className="text-3xl font-bold text-gray-400 mb-2">--</div>
                            <p className="text-sm text-gray-500">No data yet</p>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quiz Performance Insights */}
                <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center space-x-2">
                      <Brain className="h-5 w-5" />
                      <span>Performance Insights</span>
                    </CardTitle>
                    <CardDescription className="text-slate-700">
                      Analysis based on your quiz attempts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50/80 rounded-xl border border-green-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium text-green-900">Strong Performance</h4>
                        </div>
                        <p className="text-sm text-green-800">
                          History shows excellent mastery (94% average). Your knowledge in this area is solid and consistent.
                        </p>
                      </div>

                      <div className="p-4 bg-blue-50/80 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          <h4 className="font-medium text-blue-900">Improving Skills</h4>
                        </div>
                        <p className="text-sm text-blue-800">
                          Mathematics shows clear improvement (70% → 80% → 90%). Keep practicing to maintain this upward trend.
                        </p>
                      </div>

                      <div className="p-4 bg-yellow-50/80 rounded-xl border border-yellow-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                          <h4 className="font-medium text-yellow-900">Needs Attention</h4>
                        </div>
                        <p className="text-sm text-yellow-800">
                          Science (67% average) and Literature (67% single attempt) need more practice. Focus on understanding core concepts.
                        </p>
                      </div>

                      <div className="p-4 bg-purple-50/80 rounded-xl border border-purple-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <Lightbulb className="h-5 w-5 text-purple-600" />
                          <h4 className="font-medium text-purple-900">Recommendation</h4>
                        </div>
                        <p className="text-sm text-purple-800">
                          Retake Literature quiz and practice Science topics. Your improvement pattern in Math shows you can master difficult subjects with practice.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Study Tips Tab - Consolidated Recommendations */}
            <TabsContent value="recommendations" className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Study Optimization Recommendations */}
                <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-orange-900">Personalized Study Tips</CardTitle>
                        <CardDescription className="text-orange-700">Evidence-based recommendations for better learning</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-white/80 rounded-xl border border-orange-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <Target className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-900">Current Preference</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-900 mb-1">
                        Medium
                      </div>
                      <p className="text-sm text-orange-700">
                        Most of your recent quizzes were Medium difficulty - this seems to work well for you
                      </p>
                    </div>
                    
                    <div className="p-4 bg-white/80 rounded-xl border border-orange-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span className="font-medium text-orange-900">Optimal Study Time</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-900 mb-1">
                        30-45 min
                      </div>
                      <p className="text-sm text-orange-700">
                        Research-based optimal session length for focused learning
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Learning Style & Preferences */}
                <Card className="bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200 shadow-lg">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                        <Brain className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-teal-900">Learning Style Analysis</CardTitle>
                        <CardDescription className="text-teal-700">Your unique learning preferences</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-white/80 rounded-xl border border-teal-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <Activity className="h-4 w-4 text-teal-600" />
                        <span className="font-medium text-teal-900">Learning Pattern</span>
                      </div>
                      <div className="text-2xl font-bold text-teal-900 mb-1">
                        {currentData.machineLearning?.intelligentInsights?.learningPatternAnalysis?.dominantPattern || 'Consistent Learner'}
                      </div>
                      <div className="flex items-center space-x-1 mt-2">
                        <span className="text-sm text-teal-700">Pattern Strength:</span>
                        <Progress 
                          value={currentData.machineLearning?.intelligentInsights?.learningPatternAnalysis?.patternStrength || 75} 
                          className="flex-1 h-2" 
                        />
                        <span className="text-sm font-medium text-teal-900">
                          {Math.round(currentData.machineLearning?.intelligentInsights?.learningPatternAnalysis?.patternStrength || 75)}%
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-white/80 rounded-xl border border-teal-100">
                      <div className="flex items-center space-x-2 mb-3">
                        <BookOpen className="h-4 w-4 text-teal-600" />
                        <span className="font-medium text-teal-900">Study Approach</span>
                      </div>
                      <div className="text-2xl font-bold text-teal-900 mb-1">
                        Balanced Learning
                      </div>
                      <p className="text-sm text-teal-700">
                        Mix reading, practice, and review for best results
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Actionable Recommendations */}
              <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 shadow-lg">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-emerald-900">Action Plan</CardTitle>
                      <CardDescription className="text-emerald-700">Specific steps to improve your learning</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-blue-900 mb-2 text-lg">Focus on Weak Areas</h4>
                          <p className="text-sm text-blue-800 leading-relaxed">
                            Your Science scores are below average (75%). Spend extra time reviewing 
                            Science materials and take more Science quizzes to improve.
                          </p>
                          <div className="mt-3 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span className="text-xs text-blue-700 font-medium">Priority: Science subject improvement</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                          <Clock className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-purple-900 mb-2 text-lg">Maintain Consistency</h4>
                          <p className="text-sm text-purple-800 leading-relaxed">
                            You've taken 5 quizzes this week - excellent consistency! 
                            Keep this regular study pattern for continued improvement.
                          </p>
                          <div className="mt-3 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-xs text-purple-700 font-medium">Goal: Continue daily practice</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
                          <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-green-900 mb-2 text-lg">Study Method</h4>
                          <p className="text-sm text-green-800 leading-relaxed">
                            Keep study sessions to 30-45 minutes with 5-10 minute breaks. 
                            Review material within 24 hours to improve retention.
                          </p>
                          <div className="mt-3 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-green-700 font-medium">Tip: Study in short, focused sessions</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="p-3 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-lg">
                          <Target className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-yellow-900 mb-2 text-lg">Build on Strengths</h4>
                          <p className="text-sm text-yellow-800 leading-relaxed">
                            History is your strongest subject (88% average). Use this confidence 
                            to tackle similar question formats in other subjects.
                          </p>
                          <div className="mt-3 flex items-center space-x-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="text-xs text-yellow-700 font-medium">Strength: History knowledge application</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
