"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Target, TrendingUp, BookOpen, Award, Activity, Brain, CheckCircle, Lightbulb, BarChart3, TrendingDown, Calendar, AlertTriangle, Eye } from "lucide-react"
import Image from "next/image"
import {
  PerformanceChart,
  SubjectPerformanceChart,
  DifficultyBreakdownChart,
} from "@/components/analytics/performance-chart"
import { StudyInsights } from "@/components/analytics/study-insights"
import QuestionTypeAnalytics from "@/components/analytics/question-type-analytics"
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

const fetchQuestionTypeAnalytics = async () => {
  try {
    const { supabase } = await import('@/lib/supabase')
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('User not authenticated')
    }

    const { getQuestionTypeAnalytics } = await import('@/lib/question-type-analytics')
    return await getQuestionTypeAnalytics(user.id)
  } catch (error) {
    console.error('Error fetching question type analytics:', error)
    return null
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

  const { data: questionTypeAnalytics, error: questionTypeError, isLoading: questionTypeLoading } = useSWR("questionTypeAnalytics", fetchQuestionTypeAnalytics, {
    shouldRetryOnError: false,
    revalidateOnFocus: true,
    onError: (err) => {
      console.error("Question type analytics fetch error:", err)
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
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="mb-8 lg:mb-12">
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full"></div>
                <div className="absolute top-20 left-32 w-1 h-1 bg-white rounded-full"></div>
                <div className="absolute top-32 left-20 w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="absolute top-16 right-24 w-2 h-2 bg-white rounded-full"></div>
                <div className="absolute top-40 right-16 w-1 h-1 bg-white rounded-full"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 opacity-20">
                <BarChart3 className="h-8 w-8 animate-pulse" />
              </div>
              <div className="absolute bottom-4 left-4 opacity-20">
                <TrendingUp className="h-6 w-6 animate-bounce" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4">
                      <BarChart3 className="h-8 w-8 text-blue-200" />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                        Learning Analytics
                      </h1>
                      <p className="text-lg sm:text-xl text-blue-100">
                        {currentData.quizzesTaken === 0 
                          ? "Start taking quizzes to unlock powerful insights about your learning!"
                          : `Track your progress with AI-powered analytics and smart insights!`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      onClick={() => mutate()}
                      variant="outline"
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border border-white/30 rounded-2xl px-6 py-3 shadow-lg transition-all duration-300 hover:scale-105"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Refreshing...' : 'Refresh Data'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Key Metrics */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Total Study Time Card */}
            <div className="group relative bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/60 shadow-lg hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                      {formatStudyTime(currentData.totalStudyTime)}
                    </div>
                    <div className="flex items-center text-blue-600">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">+12%</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Total Study Time</h3>
                <p className="text-xs text-gray-500">Time invested in learning</p>
              </div>
            </div>

            {/* Average Score Card */}
            <div className="group relative bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/60 shadow-lg hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className={`text-3xl font-bold mb-1 ${getScoreColor(currentData.averageScore)}`}>
                      {currentData.averageScore}%
                    </div>
                    <div className="flex items-center text-blue-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">+5%</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Average Score</h3>
                <p className="text-xs text-gray-500">Your quiz performance rate</p>
              </div>
            </div>

            {/* Quizzes Taken Card */}
            <div className="group relative bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/60 shadow-lg hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-700/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-700 to-blue-800 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800 mb-1">{currentData.quizzesTaken}</div>
                    <div className="flex items-center text-blue-700">
                      <Brain className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">3 week</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Quizzes Taken</h3>
                <p className="text-xs text-gray-500">Total quiz attempts completed</p>
              </div>
            </div>

            {/* Study Streak Card */}
            <div className="group relative bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/60 shadow-lg hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800 mb-1">{currentData.studyStreak}</div>
                    <div className="flex items-center text-blue-600">
                      <Award className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Days</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Study Streak</h3>
                <p className="text-xs text-gray-500">Consecutive learning days 🔥</p>
              </div>
            </div>
          </div>

          {/* Enhanced Detailed Analytics */}
          <Tabs defaultValue="overview" className="w-full">
            <div className="flex items-center justify-center mb-4 sm:mb-6 lg:mb-8 px-2">
              <TabsList className="grid w-full max-w-full sm:max-w-4xl grid-cols-2 sm:grid-cols-3 bg-white/80 backdrop-blur-sm border border-blue-100 shadow-lg shadow-blue-100/50 rounded-xl sm:rounded-2xl p-1 gap-1 sm:gap-0">
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
                  value="quiz-progress"
                  className="rounded-lg sm:rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-xs sm:text-sm p-2 sm:p-3"
                >
                  <Target className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  <span className="hidden sm:inline">Quiz Progress</span>
                  <span className="sm:hidden">Quiz</span>
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
            </TabsContent>

            <TabsContent value="performance" className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Detailed Question Type Performance Analysis */}
              <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 shadow-xl rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                      Question Type Performance Analysis
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">AI-powered insights and detailed breakdown of your performance by question type</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg">
                    <Brain className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                {questionTypeLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">Analyzing question type performance...</p>
                  </div>
                ) : questionTypeAnalytics && questionTypeAnalytics.cumulative_performance.length > 0 ? (
                  <div className="space-y-6">
                    {/* AI-Powered Performance Interpretation */}
                    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Target className="h-5 w-5 text-blue-600 mr-2" />
                        Smart Performance Interpretation
                      </h4>
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                        {(() => {
                          const performances = questionTypeAnalytics.cumulative_performance
                          const trueFalse = performances.find(p => p.question_type === 'true_false')
                          const multipleChoice = performances.find(p => p.question_type === 'multiple_choice')
                          const identification = performances.find(p => p.question_type === 'identification')
                          
                          const getPerformanceLevel = (percentage: number) => {
                            if (percentage >= 90) return 'excellent mastery'
                            if (percentage >= 80) return 'strong proficiency'  
                            if (percentage >= 70) return 'solid understanding'
                            if (percentage >= 60) return 'developing competency'
                            return 'needs significant improvement'
                          }
                          
                          const getBestPerformingType = () => {
                            let best = { type: '', percentage: 0, display: '' }
                            if (trueFalse && trueFalse.total_percentage > best.percentage) {
                              best = { type: 'true_false', percentage: trueFalse.total_percentage, display: 'True/False' }
                            }
                            if (multipleChoice && multipleChoice.total_percentage > best.percentage) {
                              best = { type: 'multiple_choice', percentage: multipleChoice.total_percentage, display: 'Multiple Choice' }
                            }
                            if (identification && identification.total_percentage > best.percentage) {
                              best = { type: 'identification', percentage: identification.total_percentage, display: 'Identification' }
                            }
                            return best
                          }
                          
                          const getWeakestType = () => {
                            let weakest = { type: '', percentage: 100, display: '' }
                            if (trueFalse && trueFalse.total_percentage < weakest.percentage) {
                              weakest = { type: 'true_false', percentage: trueFalse.total_percentage, display: 'True/False' }
                            }
                            if (multipleChoice && multipleChoice.total_percentage < weakest.percentage) {
                              weakest = { type: 'multiple_choice', percentage: multipleChoice.total_percentage, display: 'Multiple Choice' }
                            }
                            if (identification && identification.total_percentage < weakest.percentage) {
                              weakest = { type: 'identification', percentage: identification.total_percentage, display: 'Identification' }
                            }
                            return weakest
                          }
                          
                          const bestType = getBestPerformingType()
                          const weakestType = getWeakestType()
                          
                          return (
                            <>
                              <p className="mb-4">
                                Your question type performance analysis reveals distinct patterns in your learning approach. 
                                You show <strong className={getScoreColor(bestType.percentage)}>{getPerformanceLevel(bestType.percentage)}</strong> in{' '}
                                <strong>{bestType.display}</strong> questions with {bestType.percentage.toFixed(1)}% accuracy, 
                                indicating {bestType.type === 'true_false' 
                                  ? 'strong analytical and decision-making skills for binary concepts'
                                  : bestType.type === 'multiple_choice'
                                    ? 'excellent ability to analyze options and eliminate incorrect choices'
                                    : 'superior recall and application of specific knowledge and terminology'}.
                              </p>
                              
                              <p className="mb-4">
                                Conversely, your <strong>{weakestType.display}</strong> performance at {weakestType.percentage.toFixed(1)}% suggests{' '}
                                {weakestType.type === 'true_false' 
                                  ? 'opportunities to strengthen conceptual clarity and reduce overthinking in binary decisions'
                                  : weakestType.type === 'multiple_choice'
                                    ? 'room for improvement in option analysis and strategic elimination techniques'
                                    : 'areas for growth in precise terminology, spelling accuracy, and detailed knowledge recall'}.
                                {' '}This {Math.abs(bestType.percentage - weakestType.percentage).toFixed(1)}-point gap between your strongest and weakest question types indicates{' '}
                                {Math.abs(bestType.percentage - weakestType.percentage) > 20 
                                  ? 'significant variation in your skill application across different assessment formats'
                                  : Math.abs(bestType.percentage - weakestType.percentage) > 10
                                    ? 'moderate differences in your approach to various question structures'  
                                    : 'consistent performance across all question types with minor variations'}.
                              </p>
                            </>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Detailed Question Type Insights */}
                    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                        Detailed Question Type Insights
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {questionTypeAnalytics.cumulative_performance.map((perf) => {
                          const questionTypeNames = {
                            'true_false': 'True/False',
                            'multiple_choice': 'Multiple Choice', 
                            'identification': 'Identification'
                          }
                          
                          const questionTypeColors = {
                            'true_false': 'from-green-50 to-emerald-50 border-green-200',
                            'multiple_choice': 'from-blue-50 to-cyan-50 border-blue-200',
                            'identification': 'from-purple-50 to-violet-50 border-purple-200'
                          }
                          
                          const questionTypeAdvice = {
                            'true_false': perf.total_percentage >= 80 
                              ? 'Excellent binary reasoning skills. Your ability to quickly identify correct/incorrect statements is a valuable asset.'
                              : perf.total_percentage >= 70
                                ? 'Good conceptual understanding. Focus on eliminating overthinking and trusting your initial analysis.'
                                : 'Strengthen fundamental concepts. Take time to fully understand core principles before making true/false judgments.',
                            'multiple_choice': perf.total_percentage >= 80
                              ? 'Strong analytical skills in option evaluation. Your systematic approach to elimination is highly effective.'
                              : perf.total_percentage >= 70  
                                ? 'Solid option analysis ability. Practice more strategic elimination techniques to improve accuracy.'
                                : 'Develop better option analysis strategies. Focus on identifying key words and eliminating obviously incorrect choices.',
                            'identification': perf.total_percentage >= 80
                              ? 'Excellent recall and precision. Your mastery of specific terminology and detailed knowledge is impressive.'
                              : perf.total_percentage >= 70
                                ? 'Good knowledge retention. Work on spelling accuracy and being more specific in your responses.'
                                : 'Focus on building stronger foundational knowledge. Create study aids for key terms and concepts.'
                          }
                          
                          return (
                            <div key={perf.question_type} className={`p-4 bg-gradient-to-r ${questionTypeColors[perf.question_type as keyof typeof questionTypeColors]} rounded-xl border`}>
                              <h5 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
                                <span>{questionTypeNames[perf.question_type as keyof typeof questionTypeNames]}</span>
                                <span className={`text-lg font-bold ${getScoreColor(perf.total_percentage)}`}>
                                  {perf.total_percentage.toFixed(1)}%
                                </span>
                              </h5>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-600">
                                  <span>Questions Answered:</span>
                                  <span className="font-medium">{perf.total_questions}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>Correct Answers:</span>
                                  <span className="font-medium">{perf.total_correct}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                  <span>Quizzes Taken:</span>
                                  <span className="font-medium">{perf.quiz_count}</span>
                                </div>
                                <p className="text-gray-700 mt-3 leading-relaxed">
                                  {questionTypeAdvice[perf.question_type as keyof typeof questionTypeAdvice]}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Strategic Learning Recommendations */}
                    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-white/50 shadow-lg">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Lightbulb className="h-5 w-5 text-yellow-600 mr-2" />
                        Strategic Learning Recommendations
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(() => {
                          const performances = questionTypeAnalytics.cumulative_performance
                          const recommendations = []
                          
                          // Find weakest performing question type for targeted improvement
                          const weakest = performances.reduce((prev, current) => 
                            prev.total_percentage < current.total_percentage ? prev : current
                          )
                          
                          // Find strongest performing question type for leverage
                          const strongest = performances.reduce((prev, current) => 
                            prev.total_percentage > current.total_percentage ? prev : current
                          )
                          
                          const questionTypeNames = {
                            'true_false': 'True/False',
                            'multiple_choice': 'Multiple Choice', 
                            'identification': 'Identification'
                          }
                          
                          if (weakest.total_percentage < 70) {
                            recommendations.push({
                              icon: '🎯',
                              color: 'red',
                              title: `Improve ${questionTypeNames[weakest.question_type as keyof typeof questionTypeNames]} Skills`,
                              description: weakest.question_type === 'true_false' 
                                ? 'Practice conceptual clarity and avoid overthinking binary choices'
                                : weakest.question_type === 'multiple_choice'
                                  ? 'Develop systematic elimination strategies and careful option analysis'
                                  : 'Focus on terminology mastery and precise, detailed responses'
                            })
                          }
                          
                          if (strongest.total_percentage >= 85) {
                            recommendations.push({
                              icon: '✅',
                              color: 'green', 
                              title: `Leverage ${questionTypeNames[strongest.question_type as keyof typeof questionTypeNames]} Strength`,
                              description: strongest.question_type === 'true_false'
                                ? 'Use your binary reasoning skills to tackle complex conceptual problems'
                                : strongest.question_type === 'multiple_choice'
                                  ? 'Apply your option analysis expertise to real-world decision making'
                                  : 'Utilize your detailed knowledge to mentor others and deepen understanding'
                            })
                          }
                          
                          // General improvement recommendations
                          const avgPerformance = performances.reduce((sum, p) => sum + p.total_percentage, 0) / performances.length
                          
                          if (avgPerformance >= 80) {
                            recommendations.push({
                              icon: '👁️',
                              color: 'blue',
                              title: 'Advanced Challenge Integration',
                              description: 'Mix question types in study sessions to simulate real exam conditions'
                            }, {
                              icon: '🎯',
                              color: 'purple',
                              title: 'Consistent Excellence',
                              description: 'Maintain your strong performance across all question formats'
                            })
                          } else {
                            recommendations.push({
                              icon: '📊',
                              color: 'orange',
                              title: 'Targeted Practice Sessions',
                              description: 'Dedicate extra time to your weakest question type each study session'
                            }, {
                              icon: '🕐',
                              color: 'indigo',
                              title: 'Regular Review Schedule',
                              description: 'Establish consistent practice routines for each question type'
                            })
                          }
                          
                          return recommendations.slice(0, 4).map((rec, index) => (
                            <div key={index} className={`flex items-start space-x-3 p-3 bg-${rec.color}-50 rounded-lg border border-${rec.color}-200`}>
                              <span className="text-lg mt-0.5">{rec.icon}</span>
                              <div>
                                <p className={`text-sm font-medium text-${rec.color}-900`}>{rec.title}</p>
                                <p className={`text-xs text-${rec.color}-700`}>{rec.description}</p>
                              </div>
                            </div>
                          ))
                        })()}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/70 backdrop-blur-sm p-8 rounded-2xl border border-white/50 shadow-lg text-center">
                    <div className="mb-4">
                      <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No Question Type Data Available</h4>
                    <p className="text-gray-600 mb-4">
                      Complete some quizzes to see detailed analysis of your performance by question type.
                    </p>
                    <p className="text-sm text-gray-500">
                      Your performance on True/False, Multiple Choice, and Identification questions will be analyzed here.
                    </p>
                  </div>
                )}
              </div>

              {/* Question Type Analytics Component */}
              <QuestionTypeAnalytics 
                analytics={questionTypeAnalytics || null} 
                loading={questionTypeLoading} 
              />
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
                            <div className="flex-1 min-w-0 pr-4">
                              <h4 className="font-semibold text-indigo-900 text-lg truncate" title={quiz.title}>{quiz.title}</h4>
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
                            <p className="text-sm text-amber-700 truncate px-2" title={quizProgress.find(q => q.averageScore === Math.min(...quizProgress.map(quiz => quiz.averageScore)))?.title}>
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
