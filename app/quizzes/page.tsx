"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, Filter, Play, Edit, Trash2, MoreVertical, Clock, Target, FileText, Eye, RotateCcw } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { getDifficultyColor, getUserQuizzesList, type QuizListItem } from "@/lib/quiz-utils"
import { getCurrentUser } from "@/lib/auth"
import useSWR from "swr"

export default function QuizzesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")
  const [takenQuizzes, setTakenQuizzes] = useState<Set<string>>(new Set())
  const [isHydrated, setIsHydrated] = useState(false)

  // Helper function to check if a quiz has been taken
  const hasQuizResults = (quizId: string) => {
    if (typeof window === 'undefined') return false
    
    // Check for quiz-specific results first
    const quizSpecificResults = localStorage.getItem(`quiz-results-${quizId}`)
    const storedQuiz = localStorage.getItem(`quiz-${quizId}`)
    
    if (quizSpecificResults && storedQuiz) {
      return true
    }
    
    // Fallback to check general results (for backward compatibility)
    const storedResults = localStorage.getItem("quiz-results")
    if (storedResults && storedQuiz) {
      try {
        const results = JSON.parse(storedResults)
        return results.quizId === quizId
      } catch (e) {
        return false
      }
    }
    return false
  }

  // SWR for quizzes
  const fetchQuizzes = async () => {
    const { user } = await getCurrentUser()
    if (!user) throw new Error("Please sign in to view your quizzes")
    const userQuizzes = await getUserQuizzesList(user.id)
    // Check which quizzes have been taken
    const taken = new Set<string>()
    userQuizzes.forEach((quiz: QuizListItem) => {
      if (hasQuizResults(quiz.id)) {
        taken.add(quiz.id)
      }
    })
    setTakenQuizzes(taken)
    return userQuizzes
  }
  const { data: quizzes, error } = useSWR(isHydrated ? "userQuizzesList" : null, fetchQuizzes, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    onError: (err) => {
      console.error("Quizzes fetch error:", err)
    },
  })

  useEffect(() => {
    setIsHydrated(true)
  }, [])

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
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div>
              <h1 className="text-2xl font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">My Quizzes</h1>
              <p className="text-gray-600">Manage and take your AI-generated quizzes</p>
            </div>
            <Link href="/quizzes/generate">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl px-6 shadow-lg shadow-indigo-200">
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </Link>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search quizzes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 rounded-xl"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-200 text-gray-700 rounded-xl">
                  <Filter className="mr-2 h-4 w-4" />
                  Difficulty: {filterDifficulty === "all" ? "All" : filterDifficulty}
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/50">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                  <p className="text-2xl font-semibold text-gray-900">{quizzes.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-emerald-100 shadow-lg shadow-emerald-100/50">
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl">
                  <Target className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-semibold text-gray-900">{takenQuizzes.size}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quizzes Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <div key={quiz.id} className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-100/50 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{quiz.title}</h3>
                    <p className="text-gray-600 text-sm">Created: {new Date(quiz.createdAt).toLocaleDateString()}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-indigo-50">
                        <MoreVertical className="h-4 w-4 text-indigo-600" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white/95 backdrop-blur-sm border-indigo-100">
                      <DropdownMenuItem className="hover:bg-indigo-50">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Quiz
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 hover:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Quiz
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                      {quiz.difficulty}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700">
                      {quiz.totalQuestions} questions
                    </span>
                    {takenQuizzes.has(quiz.id) && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700">
                        Completed
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2">
                    <Link href={`/quizzes/${quiz.id}/take`}>
                      <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-lg shadow-indigo-200">
                        {takenQuizzes.has(quiz.id) ? (
                          <>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Retake Quiz
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Take Quiz
                          </>
                        )}
                      </Button>
                    </Link>
                    
                    {takenQuizzes.has(quiz.id) && (
                      <Link href={`/quizzes/${quiz.id}/results?showBest=true`}>
                        <Button variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 rounded-xl">
                          <Eye className="mr-2 h-4 w-4" />
                          Review Answers
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
              <div className="p-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl inline-block mb-4">
                <FileText className="mx-auto h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || filterDifficulty !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by creating your first AI-powered quiz"}
              </p>
              <Link href="/quizzes/generate">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl px-6 shadow-lg shadow-indigo-200">
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
