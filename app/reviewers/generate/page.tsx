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
import { FileText, Brain, BookOpen, Sparkles, ArrowLeft, Download, Save, Eye, Upload } from "lucide-react"
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
          <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setGeneratedReviewer(null)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Generate Another
                  </Button>
                  <div className="h-6 w-px bg-gray-300" />
                  <div>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getTypeIcon(generatedReviewer.type)}
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold text-gray-900">{generatedReviewer.title}</h1>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className="bg-green-100 text-green-800 border-green-200">Generated</Badge>
                          <span className="text-sm text-gray-500">
                            {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className={`text-gray-700 border-gray-300 hover:bg-gray-50 ${
                      isSaved ? 'bg-green-50 border-green-300 text-green-700' : ''
                    }`}
                    onClick={handleSaveToLibrary}
                    disabled={isSaving || isSaved}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save to Library'}
                  </Button>
                  <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </div>

            {/* Full Study Material Display */}
            <Card className="shadow-sm border-0 bg-white">
              <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900">Generated Study Material</CardTitle>
                    <CardDescription className="text-gray-600">
                      Your AI-generated {generatedReviewer.type} with enhanced formatting
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {generatedReviewer.type === "summary" ? "Summary" :
                     generatedReviewer.type === "flashcards" ? "Flashcards" : "Notes"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                {generatedReviewer.type === "summary" && generatedReviewer.content.summary && (
                  <div className="prose prose-lg max-w-none">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 shadow-sm">
                      <div className="space-y-4">
                        {formatMarkdownContent(generatedReviewer.content.summary)}
                      </div>
                    </div>
                  </div>
                )}

                {generatedReviewer.type === "flashcards" && generatedReviewer.content.flashcards && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Flashcard Set ({generatedReviewer.content.flashcards.length} cards)
                      </h3>
                    </div>
                    <div className="grid gap-6">
                      {generatedReviewer.content.flashcards.map((card, index) => (
                        <Card key={index} className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
                          <CardContent className="p-6">
                            <div className="space-y-5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className="bg-purple-100 text-purple-700 rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                  </div>
                                  <span className="text-sm font-medium text-gray-600">Flashcard</span>
                                </div>
                                <div className="flex gap-2">
                                  {card.difficulty && (
                                    <Badge 
                                      variant="secondary" 
                                      className={`text-xs font-medium ${
                                        card.difficulty === 'basic' ? 'bg-green-100 text-green-700 border-green-200' :
                                        card.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                        'bg-red-100 text-red-700 border-red-200'
                                      }`}
                                    >
                                      {card.difficulty}
                                    </Badge>
                                  )}
                                  {card.category && (
                                    <Badge variant="outline" className="text-xs border-gray-300">
                                      {card.category}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="grid gap-4">
                                <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                                  <div className="flex items-center mb-2">
                                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Question</span>
                                  </div>
                                  <p className="font-medium text-purple-900 text-base leading-relaxed">{card.front}</p>
                                </div>
                                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                                  <div className="flex items-center mb-2">
                                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Answer</span>
                                  </div>
                                  <p className="text-gray-800 text-base leading-relaxed">{card.back}</p>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {generatedReviewer.type === "notes" && generatedReviewer.content.notes && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Study Notes ({generatedReviewer.content.notes.length} notes)
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {generatedReviewer.content.notes.map((note, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-4 p-6 rounded-xl border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-800 text-base leading-relaxed">
                              {formatMarkdownContent(note)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Generate Study Materials</h1>
              <p className="mt-2 text-gray-600">
                Create comprehensive, AI-powered study guides with enhanced learning features.
              </p>
            </div>
            <Link href="/library">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Library
              </Button>
            </Link>
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
                              <Brain className="h-4 w-4 text-purple-600" />
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
                              <BookOpen className="h-4 w-4 text-green-600" />
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
                      Generate Study Material
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
