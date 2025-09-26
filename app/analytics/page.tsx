"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Target, TrendingUp, BookOpen, Award, Activity } from "lucide-react"
import Image from "next/image"
import {
  PerformanceChart,
  SubjectPerformanceChart,
  DifficultyBreakdownChart,
} from "@/components/analytics/performance-chart"
import { StudyInsights } from "@/components/analytics/study-insights"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { mockPerformanceMetrics, generateStudyInsights, formatStudyTime, getScoreColor } from "@/lib/analytics-utils"
import useSWR from "swr"
import { Button } from "@/components/ui/button"

const fetchAnalytics = async () => {
  // Replace with your actual analytics fetch logic
  // Example: return await getAnalyticsDataFromSupabase()
}

export default function AnalyticsPage() {
  const insights = generateStudyInsights(mockPerformanceMetrics)

  const { data: analytics, error } = useSWR("userAnalytics", fetchAnalytics, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    onError: (err) => {
      console.error("Analytics fetch error:", err)
    },
  })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <p className="text-red-600">{error.message || "Failed to load analytics."}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Learning Analytics</h1>
            <p className="mt-2 text-gray-600">Track your progress and discover insights about your learning patterns</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Study Time</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatStudyTime(mockPerformanceMetrics.totalStudyTime)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(mockPerformanceMetrics.averageScore)}`}>
                      {mockPerformanceMetrics.averageScore}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Quizzes Taken</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPerformanceMetrics.quizzesTaken}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Activity className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Study Streak</p>
                    <p className="text-2xl font-bold text-gray-900">{mockPerformanceMetrics.studyStreak} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="subjects">Subjects</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformanceChart data={mockPerformanceMetrics.weeklyProgress} type="line" />
                <DifficultyBreakdownChart data={mockPerformanceMetrics.difficultyBreakdown} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity Summary</CardTitle>
                  <CardDescription>Your learning activity over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <Image src="/LOGO.png" alt="AI-GiR Logo" width={32} height={32} className="mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{mockPerformanceMetrics.filesUploaded}</p>
                      <p className="text-sm text-gray-600">Files Uploaded</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <BookOpen className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{mockPerformanceMetrics.reviewersGenerated}</p>
                      <p className="text-sm text-gray-600">Study Guides Created</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <Award className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">
                        {mockPerformanceMetrics.difficultyBreakdown.reduce((acc, item) => acc + item.count, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Total Quizzes</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PerformanceChart data={mockPerformanceMetrics.weeklyProgress} type="bar" />
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Trends</CardTitle>
                    <CardDescription>Analysis of your learning progress</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Score Improvement</p>
                        <p className="text-sm text-gray-600">Last 4 weeks</p>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                        <span className="text-green-600 font-medium">+13%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Study Time Increase</p>
                        <p className="text-sm text-gray-600">Compared to last month</p>
                      </div>
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-blue-600 mr-1" />
                        <span className="text-blue-600 font-medium">+67%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Consistency Score</p>
                        <p className="text-sm text-gray-600">Daily study habit</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Difficulty Progression</CardTitle>
                  <CardDescription>Your performance across different difficulty levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPerformanceMetrics.difficultyBreakdown.map((item) => (
                      <div key={item.difficulty} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <Badge
                            className={
                              item.difficulty === "Easy"
                                ? "bg-green-100 text-green-800"
                                : item.difficulty === "Medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }
                          >
                            {item.difficulty}
                          </Badge>
                          <div>
                            <p className="font-medium">{item.count} quizzes completed</p>
                            <p className="text-sm text-gray-600">Average score: {item.averageScore}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getScoreColor(item.averageScore)}`}>
                            {item.averageScore}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-6">
              <SubjectPerformanceChart data={mockPerformanceMetrics.subjectPerformance} />

              <Card>
                <CardHeader>
                  <CardTitle>Subject Analysis</CardTitle>
                  <CardDescription>Detailed breakdown of your performance by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockPerformanceMetrics.subjectPerformance.map((subject) => (
                      <div key={subject.subject} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{subject.subject}</p>
                            <p className="text-sm text-gray-600">{formatStudyTime(subject.timeSpent)} studied</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${getScoreColor(subject.averageScore)}`}>
                            {subject.averageScore}%
                          </p>
                          <p className="text-xs text-gray-500">Average</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-6">
              <StudyInsights insights={insights} />

              <Card>
                <CardHeader>
                  <CardTitle>Study Recommendations</CardTitle>
                  <CardDescription>Personalized suggestions to improve your learning</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Optimal Study Time</h4>
                      <p className="text-sm text-blue-800">
                        Based on your performance data, you tend to score higher on quizzes taken between 2-4 PM.
                        Consider scheduling your most challenging study sessions during this time.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium text-green-900 mb-2">Study Pattern Success</h4>
                      <p className="text-sm text-green-800">
                        Your consistent daily study habit is paying off! Students with similar patterns show 23% better
                        long-term retention.
                      </p>
                    </div>
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <h4 className="font-medium text-yellow-900 mb-2">Difficulty Progression</h4>
                      <p className="text-sm text-yellow-800">
                        You're ready to tackle more hard-level quizzes. Your medium-level performance suggests you can
                        handle the increased challenge.
                      </p>
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
