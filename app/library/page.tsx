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
import Link from "next/link"

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
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [activeTab, setActiveTab] = useState("files")
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
            <p className="text-gray-600">Loading library...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  const filteredFiles = mockFiles.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesFilter = filterStatus === "all" || file.status === filterStatus
    return matchesSearch && matchesFilter
  })

  const filteredReviewers = mockReviewers.filter((reviewer) => {
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
              <p className="mt-2 text-gray-600">Manage your uploaded files and generated study materials</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/analytics">
                <Button variant="outline" className="bg-transparent">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
              <Link href="/upload">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search files, reviewers, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter: {filterStatus === "all" ? "All Files" : filterStatus}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilterStatus("all")}>All Files</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("processed")}>Processed</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("processing")}>Processing</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilterStatus("error")}>Error</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Files</p>
                    <p className="text-2xl font-bold text-gray-900">{mockFiles.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Processed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockFiles.filter((f) => f.status === "processed").length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Brain className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Quizzes Generated</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mockFiles.reduce((acc, file) => acc + file.quizzesGenerated, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <BookOpen className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Study Guides</p>
                    <p className="text-2xl font-bold text-gray-900">{mockReviewers.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="files">Files ({mockFiles.length})</TabsTrigger>
              <TabsTrigger value="reviewers">Study Materials ({mockReviewers.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="files" className="space-y-4">
              {/* Files List */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Files</CardTitle>
                  <CardDescription>All your uploaded study materials</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <span className="text-2xl">{getFileIcon(file.type)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                              <p className="text-xs text-gray-500">Uploaded {file.uploadDate}</p>
                              <p className="text-xs text-gray-500">Last accessed {file.lastAccessed}</p>
                            </div>
                            <div className="flex items-center space-x-2 mt-2">
                              {file.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                            {file.status === "processed" && (
                              <div className="flex items-center space-x-4 mt-2">
                                <p className="text-xs text-blue-600">{file.quizzesGenerated} quizzes</p>
                                <p className="text-xs text-purple-600">{file.reviewersGenerated} study guides</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {getStatusBadge(file.status)}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Brain className="mr-2 h-4 w-4" />
                                Generate Quiz
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BookOpen className="mr-2 h-4 w-4" />
                                Create Study Guide
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredFiles.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500">No files found matching your criteria</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviewers" className="space-y-4">
              {/* Study Materials List */}
              <Card>
                <CardHeader>
                  <CardTitle>Study Materials</CardTitle>
                  <CardDescription>AI-generated study guides and reviewers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredReviewers.map((reviewer) => (
                      <div
                        key={reviewer.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              {getReviewerTypeIcon(reviewer.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">{reviewer.title}</p>
                            <p className="text-xs text-gray-500 mt-1">From: {reviewer.fileName}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <p className="text-xs text-gray-500">Created {reviewer.createdAt}</p>
                              <p className="text-xs text-gray-500">Last accessed {reviewer.lastAccessed}</p>
                              <Badge variant="outline" className="text-xs">
                                {reviewer.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link href={`/library/reviewers/${reviewer.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="mr-1 h-3 w-3" />
                              View
                            </Button>
                          </Link>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Export
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredReviewers.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">No study materials found</p>
                      <Link href="/upload">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          Upload Files to Generate Study Materials
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
