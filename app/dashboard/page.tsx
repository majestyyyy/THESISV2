"use client"

import { Upload, FileText, BookOpen, BarChart3, TrendingUp, Clock, Target, Award, ArrowRight, MessageSquare } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { getUserFiles } from '@/lib/file-utils'
import { getUserQuizzes } from '@/lib/quiz-utils'
import { getUserStudyMaterials } from '@/lib/reviewer-utils'
import useSWR from "swr"

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
  {
    title: "Research Survey",
    description: "Share your feedback to help improve our system",
    icon: MessageSquare,
    href: "/survey",
    color: "bg-gradient-to-br from-pink-400 to-rose-400",
  },
]


export default function DashboardPage() {
  const { user } = useAuth()
  const fetchStats = async () => {
    const files = await getUserFiles()
    const quizzes = user ? await getUserQuizzes(user.id) : []
    let streak = 0
    let today = new Date().toDateString()
    quizzes.forEach(q => {
      const quizDate = new Date(q.createdAt).toDateString()
      if (quizDate === today) streak++
    })
    const studyMaterials = await getUserStudyMaterials()
    return {
      totalFiles: files.length,
      totalQuizzes: quizzes.length,
      averageScore: studyMaterials.length,
      studyStreak: streak,
    }
  }
  const { data: stats, error } = useSWR(user ? ["dashboardStats", user.id] : null, fetchStats, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    onError: (err) => {
      // Optionally log or handle error
      console.error("Dashboard stats fetch error:", err)
    },
  })

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
            <p className="text-red-600">{error.message || "Failed to load dashboard stats."}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">Retry</button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!stats) {
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
        <div className="space-y-8 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Welcome Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.user_metadata?.first_name || user?.email?.split('@')[0]}!</h1>
            <p className="mt-2 text-gray-600">Here's an overview of your learning stats.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-amber-100 shadow-lg shadow-amber-100/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Total Quizzes</h3>
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalQuizzes}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Quizzes Taken</h3>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalQuizzes}</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100 shadow-lg shadow-emerald-100/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Total Study Materials</h3>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.averageScore}</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 shadow-lg shadow-purple-100/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Study Streak</h3>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-400 rounded-xl flex items-center justify-center">
                  <Clock className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.studyStreak} days</div>
            </div>

            
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
