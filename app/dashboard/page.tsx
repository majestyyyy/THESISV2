"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, BookOpen, BarChart3, TrendingUp, Clock, Target, Award, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

// Mock data - replace with actual data from your backend
const mockStats = {
  totalFiles: 12,
  totalQuizzes: 8,
  totalReviewers: 15,
  averageScore: 85,
  studyStreak: 7,
  hoursStudied: 24,
}

const recentActivity = [
  {
    id: 1,
    type: "quiz",
    title: "Biology Chapter 5 Quiz",
    score: 92,
    date: "2 hours ago",
  },
  {
    id: 2,
    type: "upload",
    title: "Physics Notes.pdf",
    date: "1 day ago",
  },
  {
    id: 3,
    type: "reviewer",
    title: "Chemistry Study Guide",
    date: "2 days ago",
  },
]

const quickActions = [
  {
    title: "Upload New File",
    description: "Add study materials to generate quizzes",
    icon: Upload,
    href: "/upload",
    color: "bg-blue-500",
  },
  {
    title: "Take a Quiz",
    description: "Test your knowledge with AI-generated questions",
    icon: FileText,
    href: "/quizzes",
    color: "bg-green-500",
  },
  {
    title: "Browse Library",
    description: "Access your uploaded files and materials",
    icon: BookOpen,
    href: "/library",
    color: "bg-purple-500",
  },
  {
    title: "View Analytics",
    description: "Track your learning progress and performance",
    icon: BarChart3,
    href: "/analytics",
    color: "bg-orange-500",
  },
]

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.firstName}!</h1>
            <p className="mt-2 text-gray-600">Here's an overview of your learning progress and recent activity.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Files</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalFiles}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +2 from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.totalQuizzes}</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +3 from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.averageScore}%</div>
                <p className="text-xs text-muted-foreground">
                  <TrendingUp className="inline h-3 w-3 mr-1" />
                  +5% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockStats.studyStreak} days</div>
                <p className="text-xs text-muted-foreground">Keep it up!</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-base">{action.title}</CardTitle>
                      <CardDescription className="text-sm">{action.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <Button variant="ghost" size="sm" className="p-0 h-auto">
                        Get started <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity & Progress */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest learning activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {activity.type === "quiz" && (
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Target className="h-4 w-4 text-green-600" />
                        </div>
                      )}
                      {activity.type === "upload" && (
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Upload className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      {activity.type === "reviewer" && (
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-purple-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                    {activity.score && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {activity.score}%
                      </Badge>
                    )}
                  </div>
                ))}
                <Link href="/analytics">
                  <Button variant="ghost" size="sm" className="w-full">
                    View all activity <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Your study goals and achievements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Weekly Study Goal</span>
                    <span className="text-sm text-gray-500">18/25 hours</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Quiz Accuracy</span>
                    <span className="text-sm text-gray-500">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Files Processed</span>
                    <span className="text-sm text-gray-500">12/15</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>

                <Link href="/analytics">
                  <Button variant="outline" size="sm" className="w-full bg-transparent">
                    View detailed analytics <BarChart3 className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
