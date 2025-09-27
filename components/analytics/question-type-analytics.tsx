'use client'

import type { QuestionTypeAnalytics } from '@/lib/question-type-analytics'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Target, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface QuestionTypeAnalyticsProps {
  analytics: QuestionTypeAnalytics | null
  loading?: boolean
}

function getQuestionTypeDisplayName(type: string): string {
  switch (type) {
    case 'multiple_choice':
      return 'Multiple Choice'
    case 'true_false':
      return 'True/False'
    case 'identification':
      return 'Identification'
    default:
      return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}

function getPerformanceSummary(performances: any[]): string {
  if (!performances || performances.length === 0) {
    return "No performance data available yet. Take some quizzes to see your progress!"
  }

  const totalQuestions = performances.reduce((sum, p) => sum + p.total_questions, 0)
  const totalCorrect = performances.reduce((sum, p) => sum + p.total_correct, 0)
  const overallPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  let summary = `Overall Performance: You've answered ${totalCorrect} out of ${totalQuestions} questions correctly (${overallPercentage}%).\n\n`

  summary += "Performance by Question Type:\n"
  performances
    .sort((a, b) => b.total_percentage - a.total_percentage)
    .forEach(perf => {
      const status = perf.total_percentage >= 80 ? "Excellent" : 
                    perf.total_percentage >= 70 ? "Good" : 
                    perf.total_percentage >= 60 ? "Fair" : "Needs Improvement"
      summary += `• ${getQuestionTypeDisplayName(perf.question_type)}: ${perf.total_percentage}% (${perf.total_correct}/${perf.total_questions}) - ${status}\n`
    })

  const bestType = performances.reduce((best, current) => 
    current.total_percentage > best.total_percentage ? current : best
  )
  const worstType = performances.reduce((worst, current) => 
    current.total_percentage < worst.total_percentage ? current : worst
  )

  summary += `\nStrengths: You perform best in ${getQuestionTypeDisplayName(bestType.question_type)} questions.`
  if (worstType.total_percentage < bestType.total_percentage) {
    summary += `\nArea for Improvement: Focus on ${getQuestionTypeDisplayName(worstType.question_type)} questions.`
  }

  return summary
}

export default function QuestionTypeAnalytics({ analytics, loading }: QuestionTypeAnalyticsProps) {
  const getPerformanceColor = (percentage: number): string => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 80) return "text-blue-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getPerformanceBadgeColor = (percentage: number): string => {
    if (percentage >= 90) return "bg-green-100 text-green-800"
    if (percentage >= 80) return "bg-blue-100 text-blue-800"
    if (percentage >= 70) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendColor = (trend: 'improving' | 'declining' | 'stable'): string => {
    switch (trend) {
      case 'improving':
        return "text-green-600"
      case 'declining':
        return "text-red-600"
      case 'stable':
        return "text-gray-600"
    }
  }

  const getQuestionTypeIcon = (type: string): string => {
    switch (type) {
      case 'multiple_choice':
        return 'MC'
      case 'true_false':
        return 'TF'
      case 'identification':
        return 'ID'
      default:
        return '?'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Question Type Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-2 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="mr-2 h-5 w-5" />
            Question Type Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            No analytics data available
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate overall performance
  const totalQuestions = analytics.cumulative_performance.reduce((sum, p) => sum + p.total_questions, 0)
  const totalCorrect = analytics.cumulative_performance.reduce((sum, p) => sum + p.total_correct, 0)
  const overallPercentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Enhanced Overall Performance Summary */}
      <Card className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-blue-200 shadow-xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center text-2xl">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mr-4">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                Overall Performance
              </span>
              <div className="text-sm text-gray-600 font-normal mt-1">
                Your comprehensive question type analytics
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className={`text-5xl font-bold mb-2 ${getPerformanceColor(overallPercentage)}`}>
                  {overallPercentage}%
                </div>
                <p className="text-sm text-gray-600 font-medium">Overall Accuracy</p>
                <div className="mt-3">
                  <Progress value={overallPercentage} className="h-2" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="text-4xl font-bold text-emerald-600 mb-2">{totalCorrect}</div>
                <p className="text-sm text-gray-600 font-medium">Correct Answers</p>
                <div className="mt-3 flex items-center justify-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <Target className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">{totalQuestions}</div>
                <p className="text-sm text-gray-600 font-medium">Total Questions</p>
                <div className="mt-3 flex items-center justify-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Progress Visualization */}
          <div className="bg-white/60 rounded-2xl p-6 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-800">Progress Overview</h4>
              <Badge className={`${getPerformanceBadgeColor(overallPercentage)} px-3 py-1 text-sm font-semibold`}>
                {overallPercentage >= 90 ? 'Excellent' : 
                 overallPercentage >= 80 ? 'Good' : 
                 overallPercentage >= 70 ? 'Fair' : 'Needs Improvement'}
              </Badge>
            </div>
            <div className="relative">
              <Progress value={overallPercentage} className="h-4 bg-gray-200" />
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Improvement Trends */}
      {analytics.improvement_trends.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-green-200 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center text-xl">
              <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg mr-3">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                  Performance Trends
                </span>
                <div className="text-sm text-gray-600 font-normal mt-1">
                  How your performance is changing over time
                </div>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {analytics.improvement_trends.map((trend) => {
                const trendColorClass = 
                  trend.trend === 'improving' ? 'from-green-100 to-emerald-100 border-green-300' :
                  trend.trend === 'declining' ? 'from-red-100 to-rose-100 border-red-300' :
                  'from-gray-100 to-slate-100 border-gray-300'
                
                const iconBgClass =
                  trend.trend === 'improving' ? 'bg-green-500' :
                  trend.trend === 'declining' ? 'bg-red-500' :
                  'bg-gray-500'

                return (
                  <div 
                    key={trend.question_type} 
                    className={`bg-gradient-to-r ${trendColorClass} p-5 rounded-2xl border-2 hover:shadow-lg transition-all duration-300`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${iconBgClass} rounded-xl shadow-lg flex items-center justify-center`}>
                          {getTrendIcon(trend.trend)}
                        </div>
                        <div>
                          <h5 className="text-lg font-semibold text-gray-800">
                            {getQuestionTypeDisplayName(trend.question_type)}
                          </h5>
                          <p className="text-sm text-gray-600">
                            Recent performance trend
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-bold mb-1 ${getTrendColor(trend.trend)}`}>
                          {trend.change_percentage > 0 ? '+' : ''}{trend.change_percentage.toFixed(1)}%
                        </div>
                        <Badge 
                          className={`
                            ${trend.trend === 'improving' ? 'bg-green-100 text-green-800 border-green-300' : 
                              trend.trend === 'declining' ? 'bg-red-100 text-red-800 border-red-300' : 
                              'bg-gray-100 text-gray-800 border-gray-300'}
                            px-3 py-1 text-sm font-semibold border
                          `}
                        >
                          {trend.trend === 'improving' ? '📈 Improving' : 
                           trend.trend === 'declining' ? '📉 Declining' : 
                           '📊 Stable'}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Trend Visualization */}
                    <div className="mt-4">
                      <div className="flex items-center space-x-2 text-xs text-gray-600">
                        <span>Trend:</span>
                        <div className="flex-1 h-2 bg-white/50 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              trend.trend === 'improving' ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
                              trend.trend === 'declining' ? 'bg-gradient-to-r from-red-400 to-rose-500' :
                              'bg-gradient-to-r from-gray-400 to-slate-500'
                            }`}
                            style={{
                              width: `${Math.min(Math.abs(trend.change_percentage) * 2, 100)}%`
                            }}
                          />
                        </div>
                        <span className="font-medium">
                          {Math.abs(trend.change_percentage).toFixed(1)}% change
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}


    </div>
  )
}