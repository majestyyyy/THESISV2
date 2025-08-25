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
  const [studyMaterials, setStudyMaterials] = useState<StudyMaterial[]>([])
  const [materialsLoading, setMaterialsLoading] = useState(true)

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
    loadStudyMaterials()
  }, [])

  const loadStudyMaterials = async () => {
    try {
      setMaterialsLoading(true)
      const materials = await getUserStudyMaterials()
      setStudyMaterials(materials)
    } catch (error) {
      console.error('Error loading study materials:', error)
    } finally {
      setMaterialsLoading(false)
    }
  }

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this study material?')) {
      return
    }

    try {
      const result = await deleteStudyMaterial(id)
      if (result.success) {
        setStudyMaterials(prev => prev.filter(material => material.id !== id))
      } else {
        alert(result.error || 'Failed to delete study material')
      }
    } catch (error) {
      console.error('Error deleting study material:', error)
      alert('Failed to delete study material')
    }
  }

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
        <div className="space-y-6 min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
              <p className="mt-2 text-gray-600">Store and manage your AI-generated study materials</p>
            </div>
            <div className="flex space-x-2">
              <Link href="/analytics">
                <Button variant="outline" className="bg-transparent">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  View Analytics
                </Button>
              </Link>
              <Link href="/reviewers/generate">
                <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl px-6 shadow-lg shadow-indigo-200">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Study Materials
                </Button>
              </Link>
            </div>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search study materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Study Materials List */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Study Materials</CardTitle>
              <CardDescription>AI-generated study guides and reviewers</CardDescription>
            </CardHeader>
            <CardContent>
              {materialsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading study materials...</p>
                  </div>
                </div>
              ) : (
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
                          <p className="text-xs text-gray-500">
                            Created {new Date(reviewer.createdAt).toLocaleDateString()}
                          </p>
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
                          <DropdownMenuItem
                            onClick={async () => {
                              const newTitle = prompt('Enter new name for this study material:', reviewer.title)
                              if (newTitle && newTitle.trim() && newTitle !== reviewer.title) {
                                const result = await updateStudyMaterialTitle(reviewer.id, newTitle.trim())
                                if (result.success) {
                                  setStudyMaterials(prev => prev.map(mat => mat.id === reviewer.id ? { ...mat, title: newTitle.trim() } : mat))
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
                            className="text-red-600"
                            onClick={() => handleDeleteMaterial(reviewer.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
                  
                  {filteredReviewers.length === 0 && (
                    <div className="text-center py-8">
                      <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-500 mb-4">No study materials found</p>
                      <Link href="/reviewers/generate">
                        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl px-6 shadow-lg shadow-indigo-200">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Study Materials
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
