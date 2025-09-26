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
    color: "bg-gradient-to-br from-blue-500 to-blue-600",
  },
  {
    title: "Take a Quiz",
    description: "Test your knowledge with AI-generated questions",
    icon: FileText,
    href: "/quizzes",
    color: "bg-gradient-to-br from-blue-400 to-blue-500",
  },
  {
    title: "Browse Library",
    description: "Access your uploaded files and materials",
    icon: BookOpen,
    href: "/library",
    color: "bg-gradient-to-br from-blue-600 to-blue-700",
  },
  {
    title: "View Analytics",
    description: "Track your learning progress and performance",
    icon: BarChart3,
    href: "/analytics",
    color: "bg-gradient-to-br from-blue-300 to-blue-400",
  },
  {
    title: "Research Survey",
    description: "Share your feedback to help improve our system",
    icon: MessageSquare,
    href: "/survey",
    color: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
]


export default function DashboardPage() {
  const { user } = useAuth()
  const fetchStats = async () => {
    const files = await getUserFiles()
    const quizzes = user ? await getUserQuizzes(user.id) : []
    let recentActivityCount = 0
    let today = new Date()
    today.setHours(0, 0, 0, 0)
    let sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)
    
    quizzes.forEach(q => {
      const quizDate = new Date(q.createdAt)
      if (quizDate >= sevenDaysAgo) {
        recentActivityCount++
      }
    })
    
    const studyMaterials = await getUserStudyMaterials()
    
    return {
      totalFiles: files.length,
      totalQuizzes: quizzes.length,
      studyMaterials: studyMaterials.length,
      recentActivity: recentActivityCount,
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
          <div className="flex flex-col items-center justify-center min-h-96 space-y-6 p-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
              <p className="text-red-600 mb-4">{error.message || "Failed to load dashboard stats."}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!stats) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-6 p-6">
            <div className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Dashboard</h3>
              <p className="text-gray-600">Gathering your learning statistics...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8 p-6 max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Magandang buhay, {user?.user_metadata?.first_name || user?.email?.split('@')[0]}! 👋
            </h1>
            <p className="text-lg text-gray-600">Here's an overview of your learning progress and activities.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Total Files</h3>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalFiles}</div>
              <p className="text-xs text-gray-500 mt-1">Uploaded documents</p>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Quizzes Generated</h3>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl flex items-center justify-center">
                  <Target className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalQuizzes}</div>
              <p className="text-xs text-gray-500 mt-1">AI-generated quizzes</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Study Materials</h3>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.studyMaterials}</div>
              <p className="text-xs text-gray-500 mt-1">Reviewer materials</p>
            </div>

            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">Recent Activity</h3>
                <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-blue-400 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.recentActivity}</div>
              <p className="text-xs text-gray-500 mt-1">This week</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Quick Actions</h2>
              <p className="text-gray-600">Choose what you'd like to do next</p>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {quickActions.map((action) => (
                <Link key={action.title} href={action.href}>
                  <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl border border-blue-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 cursor-pointer group transform hover:-translate-y-1">
                    <div className={`w-12 h-12 rounded-xl ${action.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">{action.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{action.description}</p>
                    <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700 transition-colors font-medium">
                      Get started <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
