"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, Filter, Play, Edit, Trash2, MoreVertical, Clock, Target, FileText, Eye, RotateCcw } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { getDifficultyColor, getUserQuizzesList, deleteQuiz, type QuizListItem } from "@/lib/quiz-utils"
import { hasUserTakenQuiz } from "@/lib/quiz-attempts"
import { getCurrentUser } from "@/lib/auth"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"
import useSWR from "swr"

export default function QuizzesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")
  const [completedQuizzes, setCompletedQuizzes] = useState<Set<string>>(new Set())
  const [isHydrated, setIsHydrated] = useState(false)
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null)

  // Helper function to check if a quiz has been completed
  const hasQuizResults = (quizId: string) => {
    return completedQuizzes.has(quizId)
  }

  // SWR for quizzes - only fetch quiz list, not completion status
  const fetchQuizzes = async () => {
    const { user } = await getCurrentUser()
    if (!user) throw new Error("Please sign in to view your quizzes")
    return await getUserQuizzesList(user.id)
  }
  const { data: quizzes, error, mutate } = useSWR(isHydrated ? "userQuizzesList" : null, fetchQuizzes, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    onError: (err) => {
      console.error("Quizzes fetch error:", err)
    },
  })

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Auto-reload when page becomes visible (e.g., returning from quiz)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && isHydrated) {
        console.log('📖 Page became visible, checking for quiz completion updates...')
        checkForNewCompletion()
      }
    }

    const handleFocus = () => {
      if (isHydrated) {
        console.log('🎯 Page focused, checking for quiz completion updates...')
        checkForNewCompletion()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [isHydrated])

  // Check for newly completed quizzes
  const checkForNewCompletion = () => {
    const completedQuizId = localStorage.getItem('quiz_completed')
    if (completedQuizId) {
      console.log('🎉 Detected newly completed quiz:', completedQuizId)
      console.log('🔄 Current completed quizzes before refresh:', Array.from(completedQuizzes))
      localStorage.removeItem('quiz_completed')
      loadCompletedQuizzes()
    } else {
      console.log('🔍 No new completion detected, loading current status...')
      loadCompletedQuizzes()
    }
  }

  // Load completed quizzes when authentication state changes
  useEffect(() => {
    if (isHydrated) {
      checkForNewCompletion()
    }
  }, [isHydrated])

  // Reload data when auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Auth state changed:', event, session?.user?.id)
      if (isHydrated && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
        console.log('🔄 Reloading quizzes and completion status due to auth change...')
        // Reload both quizzes and completion status
        mutate()
        loadCompletedQuizzes()
      }
    })

    return () => subscription.unsubscribe()
  }, [isHydrated, mutate])

  const loadCompletedQuizzes = async (retryCount = 0): Promise<void> => {
    try {
      console.log(`🔍 Loading completed quizzes from database (attempt ${retryCount + 1})...`)
      
      // Wait a bit for auth to stabilize on retry, or for database to be updated
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      } else {
        // Small delay to ensure database has been updated after quiz completion
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('❌ Auth error:', authError)
        if (retryCount < 2) {
          console.log('🔄 Retrying auth check...')
          return loadCompletedQuizzes(retryCount + 1)
        }
        setCompletedQuizzes(new Set())
        return
      }
      
      if (!user) {
        console.log('❌ No authenticated user, cannot load quiz attempts')
        setCompletedQuizzes(new Set())
        return
      }

      console.log('👤 User authenticated:', user.id)
      const { data: attempts, error } = await supabase
        .from('quiz_attempts')
        .select('quiz_id, completed_at, score')
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ Database error loading taken quizzes:', error)
        if (retryCount < 2) {
          console.log('🔄 Retrying database query...')
          return loadCompletedQuizzes(retryCount + 1)
        }
        setCompletedQuizzes(new Set())
        return
      }

      // Create a set of unique quiz IDs that have been completed
      const completedQuizIds = new Set(attempts?.map(attempt => attempt.quiz_id) || [])
      console.log(`✅ Found ${completedQuizIds.size} completed quizzes in database:`, Array.from(completedQuizIds))
      console.log('📊 Quiz attempts details:', attempts)
      console.log('🔄 Previous completed quizzes:', Array.from(completedQuizzes))
      console.log('🆕 Setting new completed quizzes:', Array.from(completedQuizIds))
      setCompletedQuizzes(completedQuizIds)
      
    } catch (error) {
      console.error('❌ Error loading taken quizzes:', error)
      if (retryCount < 2) {
        console.log('🔄 Retrying after error...')
        return loadCompletedQuizzes(retryCount + 1)
      }
      setCompletedQuizzes(new Set())
    } finally {
      // No need to manage refresh state anymore
    }
  }

  const handleEditQuiz = (quizId: string) => {
    router.push(`/quizzes/${quizId}/edit`)
  }

  const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
    if (deletingQuizId) return // Prevent multiple delete operations
    
    const confirmed = window.confirm(`Are you sure you want to delete "${quizTitle}"? This action cannot be undone.`)
    if (!confirmed) return

    setDeletingQuizId(quizId)
    try {
      const success = await deleteQuiz(quizId)
      if (success) {
        toast.success("Quiz deleted successfully!")
        // Remove from completed quizzes set
        setCompletedQuizzes(prev => {
          const newSet = new Set(prev)
          newSet.delete(quizId)
          return newSet
        })
        // Refresh the quizzes list
        mutate()
      } else {
        toast.error("Failed to delete quiz. Please try again.")
      }
    } catch (error) {
      console.error("Error deleting quiz:", error)
      toast.error("Failed to delete quiz. Please try again.")
    } finally {
      setDeletingQuizId(null)
    }
  }

  const filteredQuizzes = (quizzes || []).filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterDifficulty === "all" || quiz.difficulty === filterDifficulty
    return matchesSearch && matchesFilter
  })

  if (!isHydrated || !quizzes) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading quizzes...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
            <p className="text-red-600">{error.message || "Failed to load quizzes."}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-0">
          {/* Header */}
          <div className="flex flex-col space-y-3 sm:space-y-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">My Quizzes</h1>
              <p className="text-gray-600 text-sm sm:text-base">Manage and take your AI-generated quizzes</p>
            </div>
            <div className="flex gap-2">
              <Link href="/quizzes/generate">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg sm:rounded-xl px-4 sm:px-6 py-2 shadow-lg shadow-blue-200 text-sm sm:text-base">
                  <Plus className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Create
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 rounded-lg sm:rounded-xl text-sm sm:text-base py-2 sm:py-2.5"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-200 text-gray-700 rounded-lg sm:rounded-xl text-sm sm:text-base px-3 sm:px-4 py-2 whitespace-nowrap">
                  <Filter className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Difficulty: </span>{filterDifficulty === "all" ? "All" : filterDifficulty}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterDifficulty("all")}>All Difficulties</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterDifficulty("easy")}>Easy</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterDifficulty("medium")}>Medium</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterDifficulty("hard")}>Hard</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
            <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/50">
              <div className="flex items-center">
                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">Total Quizzes</p>
                  <p className="text-2xl font-semibold text-gray-900">{quizzes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/50">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                  <Target className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{completedQuizzes.size}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quizzes Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 
                      className="text-lg font-semibold text-gray-900 mb-2 break-words leading-tight overflow-hidden" 
                      style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: '1.3em',
                        maxHeight: '2.6em'
                      }}
                      title={quiz.title}
                    >
                      {quiz.title}
                    </h3>
                    <p className="text-gray-600 text-sm">Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                        <MoreVertical className="h-4 w-4 text-blue-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white/95 backdrop-blur-sm border-blue-100">
                      <DropdownMenuItem 
                        className="hover:bg-blue-50 cursor-pointer"
                        onClick={() => handleEditQuiz(quiz.id)}
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Quiz
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 hover:bg-red-50 cursor-pointer"
                        onClick={() => handleDeleteQuiz(quiz.id, quiz.title)}
                        disabled={deletingQuizId === quiz.id}
                      >
                        {deletingQuizId === quiz.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent mr-2"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Quiz
                          </>
                        )}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700">
                      {quiz.totalQuestions} questions
                    </span>
                    {completedQuizzes.has(quiz.id) ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-700">
                        ✅ Completed
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700">
                        ⏳ Not Started
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Link href={`/quizzes/${quiz.id}/take`}>
                      <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-blue-200">
                        {completedQuizzes.has(quiz.id) ? (
                          <>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Retake
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Take Quiz
                          </>
                        )}
                      </Button>
                    </Link>
                    
                    {completedQuizzes.has(quiz.id) && (
                      <Link href={`/quizzes/${quiz.id}/results?showBest=true`}>
                        <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50 rounded-xl">
                          <Eye className="mr-2 h-4 w-4" />
                          Review
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredQuizzes.length === 0 && (
            <div className="text-center py-16">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl inline-block mb-4">
                <FileText className="mx-auto h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || filterDifficulty !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first AI-powered quiz"}
              </p>
              <Link href="/quizzes/generate">
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-6 shadow-lg shadow-blue-200">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Quiz
                </Button>
              </Link>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
