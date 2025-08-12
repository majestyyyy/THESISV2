"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, Filter, Play, Edit, Trash2, MoreVertical, Clock, Target, FileText } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { getDifficultyColor } from "@/lib/quiz-utils"

// Mock quizzes data - replace with actual data from your backend
const mockQuizzes = [
  {
    id: "1",
    title: "Biology Chapter 5 - Cell Structure Quiz",
    description: "Test your knowledge of cell structure and organelles",
    fileName: "Biology Chapter 5 - Cell Structure.pdf",
    difficulty: "medium",
    totalQuestions: 15,
    averageScore: 85,
    timesAttempted: 3,
    createdAt: "2024-01-15",
    lastAttempted: "2024-01-16",
  },
  {
    id: "2",
    title: "Physics - Thermodynamics Quiz",
    description: "Comprehensive quiz on thermodynamics principles",
    fileName: "Physics Notes - Thermodynamics.docx",
    difficulty: "hard",
    totalQuestions: 20,
    averageScore: 78,
    timesAttempted: 2,
    createdAt: "2024-01-14",
    lastAttempted: "2024-01-15",
  },
  {
    id: "3",
    title: "Chemistry Lab Concepts",
    description: "Quiz based on chemistry lab procedures and concepts",
    fileName: "Chemistry Lab Report.txt",
    difficulty: "easy",
    totalQuestions: 10,
    averageScore: 92,
    timesAttempted: 5,
    createdAt: "2024-01-13",
    lastAttempted: "2024-01-17",
  },
]

export default function QuizzesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all")

  const filteredQuizzes = mockQuizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterDifficulty === "all" || quiz.difficulty === filterDifficulty
    return matchesSearch && matchesFilter
  })

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
              <p className="mt-2 text-gray-600">Practice with your AI-generated quizzes</p>
            </div>
            <Link href="/quizzes/generate">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Generate New Quiz
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
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Quizzes</p>
                    <p className="text-2xl font-bold text-gray-900">{mockQuizzes.length}</p>
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
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(mockQuizzes.reduce((acc, quiz) => acc + quiz.averageScore, 0) / mockQuizzes.length)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Clock className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Attempts</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockQuizzes.reduce((acc, quiz) => acc + quiz.timesAttempted, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quizzes Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{quiz.title}</CardTitle>
                      <CardDescription className="mt-1">{quiz.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Quiz
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Quiz
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Source: {quiz.fileName}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
                    <Badge variant="secondary">{quiz.totalQuestions} questions</Badge>
                  </div>

                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Average Score:</span>
                      <span className="font-medium">{quiz.averageScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Attempts:</span>
                      <span className="font-medium">{quiz.timesAttempted}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Attempted:</span>
                      <span className="font-medium">{quiz.lastAttempted}</span>
                    </div>
                  </div>

                  <Link href={`/quizzes/${quiz.id}/take`}>
                    <Button className="w-full">
                      <Play className="mr-2 h-4 w-4" />
                      Take Quiz
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredQuizzes.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No quizzes found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterDifficulty !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "Get started by generating your first AI quiz"}
              </p>
              <Link href="/quizzes/generate">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Generate Your First Quiz
                </Button>
              </Link>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
