"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { FileText, Brain, BookOpen, Sparkles, ArrowLeft, Download, Save, Eye, Upload, Target, Settings, Zap } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { generateReviewerFromFile, saveStudyMaterial } from "@/lib/reviewer-utils"
import { getUserFiles, type FileRecord } from "@/lib/file-utils"
import type { StudyMaterial } from "@/lib/reviewer-utils"
import { formatMarkdownContent } from "@/lib/content-formatter"
import Link from "next/link"

export default function GenerateReviewerPage() {
  const [uploadedFiles, setUploadedFiles] = useState<FileRecord[]>([])
  const [filesLoading, setFilesLoading] = useState(true)
  const [selectedFileId, setSelectedFileId] = useState("")
  const [reviewerType, setReviewerType] = useState<"summary" | "flashcards" | "notes">("summary")
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [customFocusArea, setCustomFocusArea] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedReviewer, setGeneratedReviewer] = useState<StudyMaterial | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const selectedFile = uploadedFiles.find((f) => f.id === selectedFileId)

  useEffect(() => {
    loadUserFiles()
  }, [])

  const loadUserFiles = async () => {
    try {
      setFilesLoading(true)
      const files = await getUserFiles()
      setUploadedFiles(files)
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setFilesLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!selectedFile) return

    setIsGenerating(true)
    setProgress(0)

    try {
      // Check if file has content
      const fileContent = selectedFile.content_text || ""
      
      if (!fileContent.trim()) {
        throw new Error("No content found in the selected file. Please ensure the PDF was properly processed and contains extractable text.")
      }

      if (fileContent.length < 50) {
        throw new Error("The file content appears to be too short for meaningful study material generation. Please select a different file.")
      }

      const reviewer = await generateReviewerFromFile(
        {
          fileId: selectedFile.id,
          fileName: selectedFile.original_name,
          type: reviewerType,
          focusAreas: focusAreas.length > 0 ? focusAreas : undefined,
        },
        fileContent,
        setProgress,
      )

      setGeneratedReviewer(reviewer)
    } catch (error) {
      console.error("Error generating reviewer:", error)
      alert(error instanceof Error ? error.message : "Failed to generate study material. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleFocusAreaToggle = (area: string) => {
    setFocusAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
  }

  const addCustomFocusArea = () => {
    if (customFocusArea.trim() && !focusAreas.includes(customFocusArea.trim())) {
      setFocusAreas((prev) => [...prev, customFocusArea.trim()])
      setCustomFocusArea("")
    }
  }

  const handleSaveToLibrary = async () => {
    if (!generatedReviewer) return

    setIsSaving(true)
    try {
      const result = await saveStudyMaterial(generatedReviewer)
      
      if (result.success) {
        setIsSaved(true)
        // Show success message for a few seconds
        setTimeout(() => setIsSaved(false), 3000)
      } else {
        alert(result.error || "Failed to save study material")
      }
    } catch (error) {
      console.error("Error saving study material:", error)
      alert("Failed to save study material. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "summary":
        return <FileText className="h-5 w-5" />
      case "flashcards":
        return <Brain className="h-5 w-5" />
      case "notes":
        return <BookOpen className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  if (generatedReviewer) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
            <div className="max-w-6xl mx-auto p-4 lg:p-8">
              
              {/* Modern Header */}
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl transform rotate-1"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>
                  
                  <div className="relative z-10">
                    {/* Top section with title and content */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-start space-x-6 flex-1">
                        <div className="relative flex-shrink-0">
                          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                            {getTypeIcon(generatedReviewer.type)}
                          </div>
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <div className="space-y-3 flex-1 min-w-0">
                          <div>
                            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-tight">
                              {generatedReviewer.title}
                            </h1>
                            <p className="text-lg lg:text-xl text-blue-100 mt-2">
                              AI-Generated {generatedReviewer.type.charAt(0).toUpperCase() + generatedReviewer.type.slice(1)}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <div className="flex items-center space-x-2 bg-white/15 px-3 py-1 rounded-full">
                              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                              <span className="text-blue-100">Ready for Review</span>
                            </div>
                            <div className="flex items-center space-x-2 text-blue-200">
                              <Target className="w-4 h-4" />
                              <span>{new Date().toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action buttons - positioned at the bottom for better UX */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-white/20">
                      <Button 
                        variant="outline"
                        onClick={() => setGeneratedReviewer(null)}
                        className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center"
                      >
                        <ArrowLeft className="mr-2 h-5 w-5" />
                        Generate New Material
                      </Button>
                      
                      <Button 
                        className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center shadow-lg ${
                          isSaved 
                            ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                            : 'bg-white text-blue-700 hover:bg-blue-50 hover:shadow-xl'
                        }`}
                        onClick={handleSaveToLibrary}
                        disabled={isSaving || isSaved}
                      >
                        <Save className="mr-2 h-5 w-5" />
                        {isSaving ? 'Saving...' : isSaved ? 'Saved to Library!' : 'Save to Library'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content Display */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/30"></div>
                  <div className="relative px-8 py-6 border-b border-gray-200/50">
                    
                  </div>
                </div>
                <div className="p-8 lg:p-12">
                  {generatedReviewer.type === "summary" && generatedReviewer.content.summary && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl transform rotate-1"></div>
                      <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-8 lg:p-10 border border-blue-100/50 shadow-lg">
                        <div className="flex items-center space-x-4 mb-8">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                              <FileText className="h-7 w-7 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                              <Sparkles className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div>
                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                              Study Summary
                            </h3>
                            <p className="text-gray-600 mt-1">Comprehensive overview for effective learning</p>
                          </div>
                        </div>
                        <div className="prose prose-lg max-w-none">
                          <div className="space-y-6 text-gray-700 leading-relaxed">
                            {formatMarkdownContent(generatedReviewer.content.summary)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {generatedReviewer.type === "flashcards" && generatedReviewer.content.flashcards && (
                    <div className="space-y-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl transform -rotate-1"></div>
                        <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-8 border border-blue-100/50 shadow-lg">
                          <div className="flex items-center space-x-4 mb-8">
                            <div className="relative">
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <Brain className="h-7 w-7 text-white" />
                              </div>
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">{generatedReviewer.content.flashcards.length}</span>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                                Flashcards
                              </h3>
                              <p className="text-gray-600 mt-1">{generatedReviewer.content.flashcards.length} cards for active recall practice</p>
                            </div>
                          </div>
                          
                          <div className="grid gap-6">
                            {generatedReviewer.content.flashcards.map((card, index) => (
                              <div key={index} className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl transform rotate-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative bg-white rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                                  <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                      <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg">
                                          {index + 1}
                                        </div>
                                        <div>
                                          <span className="text-sm font-semibold text-gray-700">Flashcard {index + 1}</span>
                                          <div className="text-xs text-gray-500">Active Recall Practice</div>
                                        </div>
                                      </div>
                                      {card.difficulty && (
                                        <Badge 
                                          className={`px-3 py-1 text-xs font-medium ${
                                            card.difficulty === 'basic' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                            card.difficulty === 'intermediate' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                            'bg-red-100 text-red-700 border-red-200'
                                          }`}
                                        >
                                          {card.difficulty.charAt(0).toUpperCase() + card.difficulty.slice(1)}
                                        </Badge>
                                      )}
                                    </div>
                                    
                                    <div className="grid md:grid-cols-2 gap-6">
                                      <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl"></div>
                                        <div className="relative bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-blue-100/50">
                                          <div className="flex items-center space-x-2 mb-3">
                                            <div className="w-6 h-6 bg-blue-500 rounded-lg flex items-center justify-center">
                                              <span className="text-xs font-bold text-white">Q</span>
                                            </div>
                                            <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Question</span>
                                          </div>
                                          <p className="font-medium text-gray-800 leading-relaxed">{card.front}</p>
                                        </div>
                                      </div>
                                      
                                      <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl"></div>
                                        <div className="relative bg-white/70 backdrop-blur-sm rounded-xl p-5 border border-indigo-100/50">
                                          <div className="flex items-center space-x-2 mb-3">
                                            <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
                                              <span className="text-xs font-bold text-white">A</span>
                                            </div>
                                            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Answer</span>
                                          </div>
                                          <p className="text-gray-700 leading-relaxed">{card.back}</p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {generatedReviewer.type === "notes" && generatedReviewer.content.notes && (
                    <div className="space-y-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl transform rotate-1"></div>
                        <div className="relative bg-gradient-to-br from-white to-blue-50/30 rounded-3xl p-8 border border-blue-100/50 shadow-lg">
                          <div className="flex items-center space-x-4 mb-8">
                            <div className="relative">
                              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                                <BookOpen className="h-7 w-7 text-white" />
                              </div>
                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-400 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-white">{generatedReviewer.content.notes.length}</span>
                              </div>
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                                Study Notes
                              </h3>
                              <p className="text-gray-600 mt-1">{generatedReviewer.content.notes.length} organized notes for comprehensive understanding</p>
                            </div>
                          </div>
                          
                          <div className="grid gap-6">
                            {generatedReviewer.content.notes.map((note, index) => (
                              <div key={index} className="group relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl transform -rotate-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative bg-white rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                                  <div className="p-6">
                                    <div className="flex items-start space-x-4">
                                      <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 text-white rounded-xl flex items-center justify-center font-bold shadow-lg">
                                          {index + 1}
                                        </div>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="mb-3">
                                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                                            Note {index + 1}
                                          </span>
                                        </div>
                                        <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                                          {formatMarkdownContent(note)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-indigo-600/80"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <Link href="/library">
                    <Button variant="ghost" className="text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Library
                    </Button>
                  </Link>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-blue-500 text-white shadow-lg">
                      <Brain className="mr-1 h-3 w-3" />
                      AI Study Generator
                    </Badge>
                    <Badge className="bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                      Smart Learning
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">Generate Study Materials</h1>
                    <p className="text-blue-100 text-lg">
                      Create comprehensive study guides from your documents
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-blue-200" />
                      <span>AI-powered content analysis</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-blue-200" />
                      <span>Customizable material types</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-blue-200" />
                      <span>Multiple format options</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          {isGenerating ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  <span>Generating Study Material</span>
                </CardTitle>
                <CardDescription>
                  Advanced AI is creating comprehensive, pedagogically-optimized study materials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="w-full" />
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600 font-medium">
                    {progress < 20 && "Analyzing file content and structure..."}
                    {progress >= 20 && progress < 40 && "Processing content with advanced AI..."}
                    {progress >= 40 && progress < 60 && "Creating comprehensive study materials..."}
                    {progress >= 60 && progress < 80 && "Optimizing for learning effectiveness..."}
                    {progress >= 80 && "Finalizing your enhanced study material..."}
                  </p>
                  <p className="text-xs text-gray-500">
                    {progress < 30 && "Understanding key concepts and relationships"}
                    {progress >= 30 && progress < 70 && "Generating pedagogically-sound content with examples and memory aids"}
                    {progress >= 70 && "Adding interactive elements and study strategies"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuration */}
              <div className="lg:col-span-2 space-y-6">
                {/* File Selection */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select File</CardTitle>
                    <CardDescription>Choose a file to generate study materials from</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {filesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                          <p className="text-gray-600">Loading your documents...</p>
                        </div>
                      </div>
                    ) : uploadedFiles.length === 0 ? (
                      <div className="text-center py-8">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Documents Available</h3>
                        <p className="text-gray-600 mb-6">
                          You need to upload some documents before you can generate study materials.
                        </p>
                        <Link href="/upload">
                          <Button className="inline-flex items-center space-x-2">
                            <FileText className="w-4 h-4" />
                            <span>Upload Documents</span>
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="file-select">Select Source File</Label>
                        <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                          <SelectTrigger>
                            <SelectValue placeholder="Choose a file to generate study materials from" />
                          </SelectTrigger>
                          <SelectContent>
                            {uploadedFiles.map((file) => (
                              <SelectItem key={file.id} value={file.id}>
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center">
                                    <FileText className="mr-2 h-4 w-4" />
                                    <span>{file.original_name}</span>
                                  </div>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {new Date(file.upload_date).toLocaleDateString()}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {selectedFileId && (
                          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="text-sm font-medium text-blue-900">
                                  {uploadedFiles.find(f => f.id === selectedFileId)?.original_name}
                                </p>
                                <p className="text-xs text-blue-700">
                                  Ready for study material generation
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Study Material Type */}
                <Card>
                  <CardHeader>
                    <CardTitle>Study Material Type</CardTitle>
                    <CardDescription>Choose the type of study material to generate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={reviewerType} onValueChange={(value: any) => setReviewerType(value)}>
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value="summary" id="summary" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4 text-blue-600" />
                              <Label htmlFor="summary" className="font-medium cursor-pointer">
                                Study Guide
                              </Label>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Comprehensive study guide with learning objectives, key concepts, definitions, review questions, and study strategies
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value="flashcards" id="flashcards" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <Brain className="h-4 w-4 text-blue-600" />
                              <Label htmlFor="flashcards" className="font-medium cursor-pointer">
                                Flashcards
                              </Label>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Enhanced flashcards with difficulty levels, categories, and pedagogically-optimized questions for active recall
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 p-4 border rounded-lg">
                          <RadioGroupItem value="notes" id="notes" />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                              <Label htmlFor="notes" className="font-medium cursor-pointer">
                                Quick Notes
                              </Label>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              Organized, memorable study notes with visual cues, memory aids, and cross-references between concepts
                            </p>
                          </div>
                        </div>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                {/* Focus Areas */}
                <Card>
                  <CardHeader>
                    <CardTitle>Focus Areas (Optional)</CardTitle>
                    <CardDescription>Specify topics to emphasize in your study material</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {focusAreas.map((area) => (
                        <Badge
                          key={area}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => handleFocusAreaToggle(area)}
                        >
                          {area} ×
                        </Badge>
                      ))}
                    </div>

                    <div className="flex space-x-2">
                      <Input
                        placeholder="Add focus area (e.g., 'cell membrane', 'photosynthesis')"
                        value={customFocusArea}
                        onChange={(e) => setCustomFocusArea(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && addCustomFocusArea()}
                      />
                      <Button onClick={addCustomFocusArea} variant="outline">
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Generation Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Selected File</Label>
                      <p className="text-sm text-gray-900 mt-1">
                        {selectedFile ? selectedFile.original_name : "No file selected"}
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <Label className="text-sm font-medium text-gray-600">Material Type</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        {getTypeIcon(reviewerType)}
                        <p className="text-sm text-gray-900 capitalize">{reviewerType}</p>
                      </div>
                    </div>

                    {focusAreas.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <Label className="text-sm font-medium text-gray-600">Focus Areas</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {focusAreas.map((area) => (
                              <Badge key={area} variant="outline" className="text-xs">
                                {area}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    <Button onClick={handleGenerate} disabled={!selectedFileId} className="w-full">
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
