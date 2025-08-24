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
import { generateReviewerFromFile } from "@/lib/reviewer-utils"
import { getUserFiles, type FileRecord } from "@/lib/file-utils"
import type { StudyMaterial } from "@/lib/reviewer-utils"
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
      const reviewer = await generateReviewerFromFile(
        {
          fileId: selectedFile.id,
          fileName: selectedFile.original_name,
          type: reviewerType,
          focusAreas: focusAreas.length > 0 ? focusAreas : undefined,
        },
        selectedFile.content_text || "",
        setProgress,
      )

      setGeneratedReviewer(reviewer)
    } catch (error) {
      console.error("Error generating reviewer:", error)
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" onClick={() => setGeneratedReviewer(null)}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Generate Another
                </Button>
                <div>
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(generatedReviewer.type)}
                    <h1 className="text-3xl font-bold text-gray-900">{generatedReviewer.title}</h1>
                    <Badge className="bg-green-100 text-green-800">Generated</Badge>
                  </div>
                  <p className="mt-2 text-gray-600">AI-generated study material from your uploaded file</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Save to Library
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Link href={`/library/reviewers/${generatedReviewer.id}`}>
                  <Button size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    View Full
                  </Button>
                </Link>
              </div>
            </div>

            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Study Material Preview</CardTitle>
                <CardDescription>Your AI-generated {generatedReviewer.type} is ready</CardDescription>
              </CardHeader>
              <CardContent>
                {generatedReviewer.type === "summary" && generatedReviewer.content.summary && (
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed max-h-96 overflow-y-auto">
                      {generatedReviewer.content.summary.substring(0, 1000)}
                      {generatedReviewer.content.summary.length > 1000 && "..."}
                    </div>
                  </div>
                )}

                {generatedReviewer.type === "flashcards" && generatedReviewer.content.flashcards && (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {generatedReviewer.content.flashcards.slice(0, 3).map((card, index) => (
                      <Card key={index} className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <p className="font-medium text-purple-700">Q: {card.front}</p>
                            <p className="text-gray-700">A: {card.back}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {generatedReviewer.content.flashcards.length > 3 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{generatedReviewer.content.flashcards.length - 3} more flashcards
                      </p>
                    )}
                  </div>
                )}

                {generatedReviewer.type === "notes" && generatedReviewer.content.notes && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {generatedReviewer.content.notes.slice(0, 5).map((note, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-l-green-500"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 text-sm">{note}</p>
                      </div>
                    ))}
                    {generatedReviewer.content.notes.length > 5 && (
                      <p className="text-sm text-gray-500 text-center">
                        +{generatedReviewer.content.notes.length - 5} more notes
                      </p>
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

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Generate Study Materials</h1>
              <p className="mt-2 text-gray-600">
                Create AI-powered study guides, flashcards, and notes from your files
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
                  AI is analyzing your content and creating personalized study materials
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-gray-600 text-center">
                  {progress < 30 && "Analyzing file content..."}
                  {progress >= 30 && progress < 80 && "Generating study material with AI..."}
                  {progress >= 80 && "Finalizing your study material..."}
                </p>
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
                              Comprehensive summary with key concepts, definitions, and study tips
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
                              Interactive flashcards for quick review and memorization
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
                              Concise bullet points covering the most important information
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
