"use client"

import { Upload, FileText, BookOpen, BarChart3, TrendingUp, Clock, Target, Award, ArrowRight, MessageSquare, Sparkles, Zap, Brain, Trophy, Star, Calendar, CheckCircle, Activity } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { QuickStartGuide } from "@/components/ui/quick-start-guide"
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
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Enhanced Welcome Section */}
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
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>
              <div className="absolute bottom-4 left-4 opacity-20">
                <Brain className="h-6 w-6 animate-bounce" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4">
                    <Trophy className="h-8 w-8 text-yellow-300" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                      Magandang buhay, {user?.user_metadata?.first_name || user?.email?.split('@')[0]}! 
                      <span className="inline-block animate-wave ml-2">👋</span>
                    </h1>
                    <p className="text-lg sm:text-xl text-blue-100">
                      {stats.totalFiles === 0 
                        ? "Ready to unlock your learning potential with AI? Let's begin this exciting journey!"
                        : `Welcome to your AI-powered learning hub. I'll help you make great progress!`
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Start Guide for New Users */}
          {stats.totalFiles === 0 && (
            <div className="mb-8">
              <QuickStartGuide />
            </div>
          )}

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Total Files Card */}
            <div className="group relative bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/60 shadow-lg hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800 mb-1">{stats.totalFiles}</div>
                    <div className="flex items-center text-blue-600">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Files</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Total Files</h3>
                <p className="text-xs text-gray-500">Uploaded documents ready for AI processing</p>
              </div>
            </div>

            {/* Quizzes Card */}
            <div className="group relative bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/60 shadow-lg hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-600/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800 mb-1">{stats.totalQuizzes}</div>
                    <div className="flex items-center text-blue-600">
                      <Brain className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Quizzes</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">AI Quizzes</h3>
                <p className="text-xs text-gray-500">Smart questions generated from your materials</p>
              </div>
            </div>

            {/* Study Materials Card */}
            <div className="group relative bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/60 shadow-lg hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-700/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-700 to-blue-800 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800 mb-1">{stats.studyMaterials}</div>
                    <div className="flex items-center text-blue-700">
                      <Award className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">Reviews</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Study Materials</h3>
                <p className="text-xs text-gray-500">Comprehensive review materials generated</p>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="group relative bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/60 shadow-lg hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-blue-400 to-blue-500 p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-gray-800 mb-1">{stats.recentActivity}</div>
                    <div className="flex items-center text-blue-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span className="text-sm font-medium">This Week</span>
                    </div>
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Recent Activity</h3>
                <p className="text-xs text-gray-500">Your learning engagement this week</p>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Actions Section */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-3xl p-8 border border-gray-200/50">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Actions</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Choose your next learning adventure. Each action is designed to enhance your educational journey with AI-powered tools.</p>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {quickActions.map((action, index) => (
                <Link key={action.title} href={action.href}>
                  <div className="group relative bg-gradient-to-br from-white to-blue-50/50 backdrop-blur-sm p-6 rounded-2xl border border-blue-200/60 shadow-lg hover:shadow-2xl hover:shadow-blue-200/40 transition-all duration-500 hover:-translate-y-2 overflow-hidden cursor-pointer">
                    {/* Background pattern similar to stats cards */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`${action.color} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          <action.icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-sm font-semibold text-gray-700 mb-1">{action.title}</h3>
                      <p className="text-xs text-gray-500 mb-4">{action.description}</p>
                      
                      <div className="flex items-center text-blue-600">
                        <ArrowRight className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">Start Now</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Learning Tips Section */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200/50">
            <div className="flex items-start space-x-4">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Learning Tip of the Day</h3>
                <p className="text-gray-700 mb-3">
                  {stats.totalFiles === 0 
                    ? "Start by uploading a PDF document from your courses. Our AI will analyze it and create personalized quizzes to help you study more effectively!"
                    : stats.totalQuizzes < 3
                    ? "Try taking quizzes from different topics to improve your retention. Spaced repetition is key to long-term learning success!"
                    : "Great progress! Consider reviewing your analytics to identify areas where you can improve and focus your study sessions."
                  }
                </p>
                <div className="flex items-center space-x-4 text-sm text-blue-700">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>5 min read</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 mr-1" />
                    <span>Study Smart</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
