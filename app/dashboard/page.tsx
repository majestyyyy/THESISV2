"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
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
    color: "bg-gradient-to-br from-blue-400 to-cyan-400",
  },
  {
    title: "Take a Quiz",
    description: "Test your knowledge with AI-generated questions",
    icon: FileText,
    href: "/quizzes",
    color: "bg-gradient-to-br from-emerald-400 to-teal-400",
  },
  {
    title: "Browse Library",
    description: "Access your uploaded files and materials",
    icon: BookOpen,
    href: "/library",
    color: "bg-gradient-to-br from-purple-400 to-indigo-400",
  },
  {
    title: "View Analytics",
    description: "Track your learning progress and performance",
    icon: BarChart3,
    href: "/analytics",
    color: "bg-gradient-to-br from-orange-400 to-amber-400",
  },
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  if (!isHydrated) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

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
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Total Files</h3>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{mockStats.totalFiles}</div>
              <p className="text-xs text-blue-600 mt-1 flex items-center">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +2 from last week
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100 shadow-lg shadow-emerald-100/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Quizzes Taken</h3>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{mockStats.totalQuizzes}</div>
              <p className="text-xs text-emerald-600 mt-1 flex items-center">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +3 from last week
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 shadow-lg shadow-purple-100/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Average Score</h3>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-xl flex items-center justify-center">
                  <Award className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{mockStats.averageScore}%</div>
              <p className="text-xs text-purple-600 mt-1 flex items-center">
                <TrendingUp className="inline h-3 w-3 mr-1" />
                +5% from last week
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-amber-100 shadow-lg shadow-amber-100/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Study Streak</h3>
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{mockStats.studyStreak} days</div>
              <p className="text-xs text-amber-600 mt-1">Keep it up!</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300 cursor-pointer group">
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{action.description}</p>
                    <div className="flex items-center text-sm text-indigo-600 group-hover:text-indigo-700 transition-colors">
                      Get started <ArrowRight className="ml-1 h-3 w-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Activity & Progress */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/50">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-600">Your latest learning activities</p>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {activity.type === "quiz" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                          <Target className="h-4 w-4 text-emerald-600" />
                        </div>
                      )}
                      {activity.type === "upload" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                          <Upload className="h-4 w-4 text-blue-600" />
                        </div>
                      )}
                      {activity.type === "reviewer" && (
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-purple-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.title}</p>
                      <p className="text-sm text-gray-500">{activity.date}</p>
                    </div>
                    {activity.score && (
                      <span className="px-2 py-1 bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 text-xs rounded-full font-medium">
                        {activity.score}%
                      </span>
                    )}
                  </div>
                ))}
                <Link href="/analytics">
                  <button className="w-full flex items-center justify-center px-4 py-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 text-sm transition-colors rounded-xl">
                    View all activity <ArrowRight className="ml-1 h-3 w-3" />
                  </button>
                </Link>
              </div>
            </div>

            {/* Learning Progress */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 shadow-lg shadow-purple-100/50">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Learning Progress</h3>
                <p className="text-sm text-gray-600">Your study goals and achievements</p>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Weekly Study Goal</span>
                    <span className="text-sm text-blue-600">18/25 hours</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Quiz Accuracy</span>
                    <span className="text-sm text-emerald-600">85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Files Processed</span>
                    <span className="text-sm text-purple-600">12/15</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>

                <Link href="/analytics">
                  <button className="w-full flex items-center justify-center px-4 py-3 text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors">
                    View detailed analytics <BarChart3 className="ml-1 h-3 w-3" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
