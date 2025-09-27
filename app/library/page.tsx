"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FileText,
  Search,
  Filter,
  MoreVertical,
  Download,
  Trash2,
  Eye,
  FileIcon,
  Plus,
  BookOpen,
  Brain,
  BarChart3,
} from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { formatFileSize } from "@/lib/file-utils"
import { getUserStudyMaterials, deleteStudyMaterial, updateStudyMaterialTitle } from "@/lib/reviewer-utils"
import type { StudyMaterial } from "@/lib/reviewer-utils"
import Link from "next/link"
import useSWR from "swr"

// Mock data - replace with actual data from your backend
const mockFiles = [
  {
    id: "1",
    name: "Biology Chapter 5 - Cell Structure.pdf",
    type: "application/pdf",
    size: 2456789,
    uploadDate: "2024-01-15",
    status: "processed",
    quizzesGenerated: 3,
    reviewersGenerated: 1,
    lastAccessed: "2024-01-17",
    tags: ["biology", "cells", "chapter-5"],
  },
  {
    id: "2",
    name: "Physics Notes - Thermodynamics.docx",
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 1234567,
    uploadDate: "2024-01-14",
    status: "processed",
    quizzesGenerated: 2,
    reviewersGenerated: 2,
    lastAccessed: "2024-01-16",
    tags: ["physics", "thermodynamics", "notes"],
  },
  {
    id: "3",
    name: "Chemistry Lab Report.txt",
    type: "text/plain",
    size: 567890,
    uploadDate: "2024-01-13",
    status: "processing",
    quizzesGenerated: 0,
    reviewersGenerated: 0,
    lastAccessed: "2024-01-13",
    tags: ["chemistry", "lab", "report"],
  },
  {
    id: "4",
    name: "Mathematics - Calculus Fundamentals.pdf",
    type: "application/pdf",
    size: 3456789,
    uploadDate: "2024-01-12",
    status: "processed",
    quizzesGenerated: 5,
    reviewersGenerated: 3,
    lastAccessed: "2024-01-17",
    tags: ["mathematics", "calculus", "fundamentals"],
  },
]

const mockReviewers = [
  {
    id: "1",
    title: "Cell Structure Study Guide",
    fileId: "1",
    fileName: "Biology Chapter 5 - Cell Structure.pdf",
    type: "summary",
    createdAt: "2024-01-16",
    lastAccessed: "2024-01-17",
  },
  {
    id: "2",
    title: "Thermodynamics Flashcards",
    fileId: "2",
    fileName: "Physics Notes - Thermodynamics.docx",
    type: "flashcards",
    createdAt: "2024-01-15",
    lastAccessed: "2024-01-16",
  },
  {
    id: "3",
    title: "Calculus Quick Reference",
    fileId: "4",
    fileName: "Mathematics - Calculus Fundamentals.pdf",
    type: "notes",
    createdAt: "2024-01-14",
    lastAccessed: "2024-01-17",
  },
]

export default function LibraryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("reviewers")
  const [isHydrated, setIsHydrated] = useState(false)

  // SWR for study materials
  const { data: studyMaterials, mutate, error } = useSWR(isHydrated ? "userStudyMaterials" : null, getUserStudyMaterials, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    onError: (err) => {
      console.error("Study materials fetch error:", err)
    },
  })

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study material?')) {
      return
    }
    try {
      const result = await deleteStudyMaterial(id)
      if (result.success && studyMaterials) {
        mutate(studyMaterials.filter((material: any) => material.id !== id), false)
      } else {
        alert(result.error || 'Failed to delete study material')
      }
    } catch (error) {
      console.error('Error deleting study material:', error)
      alert('Failed to delete study material')
    }
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-6 p-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Unable to Load Library</h3>
              <p className="text-red-600 mb-6">{error.message || "Failed to load study materials."}</p>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-medium"
              >
                Try Again
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!isHydrated || !studyMaterials) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-6 p-6">
            <div className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-2xl p-10 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="animate-spin rounded-full h-10 w-10 border-3 border-white border-t-transparent"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Loading Your Library</h3>
              <p className="text-blue-600 font-medium">Gathering your study materials...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const filteredReviewers = studyMaterials.filter((reviewer) => {
    return (
      reviewer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reviewer.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const getFileIcon = (type: string) => {
    switch (type) {
      case "application/pdf":
        return "📄"
      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        return "📝"
      case "text/plain":
        return "📃"
      default:
        return "📄"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return <Badge className="bg-green-100 text-green-800">Processed</Badge>
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const getReviewerTypeIcon = (type: string) => {
    switch (type) {
      case "summary":
        return <FileText className="h-4 w-4" />
      case "flashcards":
        return <Brain className="h-4 w-4" />
      case "notes":
        return <BookOpen className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl border border-blue-200 shadow-lg shadow-blue-100/50 p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-3 sm:space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="p-2.5 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl shadow-lg">
                  <BookOpen className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">My Library</h1>
                  <p className="text-blue-700 font-medium text-sm sm:text-base">Organize and access your AI-generated study materials</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
               
                <Link href="/reviewers/generate">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 px-4 sm:px-6 py-2 sm:py-2.5 font-semibold text-sm sm:text-base">
                    <Plus className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    Create New
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Enhanced Search and Filters */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-blue-200 shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                <Input
                  placeholder="Search by title, file name, or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 rounded-lg sm:rounded-xl text-sm"
                />
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto justify-center">
                <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 text-xs sm:text-sm px-2 sm:px-3 py-1">
                  {filteredReviewers.length} found
                </Badge>
              </div>
            </div>
          </div>

          {/* Enhanced Study Materials Grid */}
          <div className="space-y-4 sm:space-y-6">
            {filteredReviewers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredReviewers.map((reviewer) => (
                  <Card key={reviewer.id} className="bg-white/90 backdrop-blur-sm border-blue-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300 transform hover:-translate-y-1">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                            {getReviewerTypeIcon(reviewer.type)}
                          </div>
                          <div className="flex-1">
                            <Badge 
                              variant="outline" 
                              className="text-xs capitalize bg-blue-50 text-blue-700 border-blue-200 mb-2"
                            >
                              {reviewer.type}
                            </Badge>
                          </div>
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
                              onClick={async () => {
                                const newTitle = prompt('Enter new name for this study material:', reviewer.title)
                                if (newTitle && newTitle.trim() && newTitle !== reviewer.title) {
                                  const result = await updateStudyMaterialTitle(reviewer.id, newTitle.trim())
                                  if (result.success) {
                                    mutate((prev: any) => prev.map((mat: any) => mat.id === reviewer.id ? { ...mat, title: newTitle.trim() } : mat), false)
                                  } else {
                                    alert(result.error || 'Failed to rename study material')
                                  }
                                }
                              }}
                            >
                              <BookOpen className="mr-2 h-4 w-4" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600 hover:bg-red-50 cursor-pointer"
                              onClick={() => handleDeleteMaterial(reviewer.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 leading-tight">
                          {reviewer.title}
                        </h3>
                        
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                          <p className="text-sm text-blue-700 font-medium mb-1">Source File</p>
                          <p className="text-sm text-blue-600 truncate">{reviewer.fileName}</p>
                        </div>

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span>Created {new Date(reviewer.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-blue-100">
                        <Link href={`/library/reviewers/${reviewer.id}`}>
                          <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200">
                            <Eye className="mr-2 h-4 w-4" />
                            Study
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-blue-200 shadow-lg p-12 max-w-md mx-auto">
                  <div className="p-4 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl inline-block mb-6">
                    <BookOpen className="h-12 w-12 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Study Materials Yet</h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {searchTerm 
                      ? `No materials found matching "${searchTerm}". Try adjusting your search.`
                      : "Start building your knowledge base by creating AI-powered study materials from your documents."
                    }
                  </p>
                  <Link href="/reviewers/generate">
                    <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 px-8 py-3 text-lg font-semibold">
                      <Plus className="mr-2 h-5 w-5" />
                      Create Your First Material
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
