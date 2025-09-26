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
import { FileText, Brain, BookOpen, Sparkles, ArrowLeft, Download, Save, Eye, Upload, Zap, Target, Settings, RefreshCw } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { generateReviewerFromFile, saveStudyMaterial } from "@/lib/reviewer-utils"
import { getUserFiles, type FileRecord } from "@/lib/file-utils"
import type { StudyMaterial } from "@/lib/reviewer-utils"
import { formatMarkdownContent } from "@/lib/content-formatter"
import Link from "next/link"

export default function GenerateStudyMaterialPage() {
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

  const commonFocusAreas = [
    "Key Concepts", "Important Definitions", "Examples & Cases", "Formulas & Equations",
    "Historical Context", "Critical Analysis", "Main Arguments", "Supporting Evidence",
    "Methodology", "Conclusions", "Applications", "Future Implications"
  ]

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "summary":
        return "from-blue-500 to-indigo-600"
      case "flashcards":
        return "from-green-500 to-emerald-600"
      case "notes":
        return "from-purple-500 to-violet-600"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  const getTypeBg = (type: string) => {
    switch (type) {
      case "summary":
        return "from-blue-50 to-indigo-50"
      case "flashcards":
        return "from-green-50 to-emerald-50"
      case "notes":
        return "from-purple-50 to-violet-50"
      default:
        return "from-gray-50 to-gray-50"
    }
  }

  // Show generated material preview
  if (generatedReviewer) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="max-w-7xl mx-auto p-6 space-y-8">
              {/* Enhanced Header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-700 to-green-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-emerald-600/80"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <Button 
                      variant="ghost" 
                      onClick={() => setGeneratedReviewer(null)}
                      className="text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Generate
                    </Button>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-green-500 text-white shadow-lg">
                        ✨ AI Generated
                      </Badge>
                      <Badge className="bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                        {generatedReviewer.type === "summary" ? "📄 Summary" :
                         generatedReviewer.type === "flashcards" ? "🧠 Flashcards" : "📝 Notes"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getTypeColor(generatedReviewer.type)}`}>
                      {getTypeIcon(generatedReviewer.type)}
                    </div>
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-white mb-2">{generatedReviewer.title}</h1>
                      <p className="text-green-100 text-lg">
                        Your personalized {generatedReviewer.type} is ready for review
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                    <div className="flex flex-wrap items-center gap-4 text-sm text-green-100">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-green-200" />
                        <span>Source: {generatedReviewer.fileName}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-4 w-4 text-green-200" />
                        <span>
                          {generatedReviewer.type === "summary" ? "📖 Comprehensive Guide" : 
                           generatedReviewer.type === "flashcards" ? `🎯 ${generatedReviewer.content.flashcards?.length || 0} Cards` :
                           `📚 ${generatedReviewer.content.notes?.length || 0} Study Points`}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Sparkles className="h-4 w-4 text-green-200" />
                        <span>AI-powered learning optimization</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  onClick={handleSaveToLibrary}
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                >
                  {isSaving ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isSaving ? "Saving..." : isSaved ? "Saved!" : "Save to Library"}
                </Button>
                
                <Link href="/library">
                  <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-3">
                    <Eye className="mr-2 h-4 w-4" />
                    View Library
                  </Button>
                </Link>
              </div>

              {/* Generated Content Preview */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                <div className={`p-6 border-b bg-gradient-to-r ${getTypeBg(generatedReviewer.type)} border-gray-100`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r ${getTypeColor(generatedReviewer.type)}`}>
                        <div className="text-white">
                          {getTypeIcon(generatedReviewer.type)}
                        </div>
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                          {generatedReviewer.type === "summary" ? "Study Summary" :
                           generatedReviewer.type === "flashcards" ? "Interactive Flashcards" : "Study Notes"}
                        </h2>
                        <p className="text-sm font-medium text-gray-600">
                          Generated study material ready for learning
                        </p>
                      </div>
                    </div>
                    
                    <Badge className="bg-green-100 text-green-700 border-green-200 shadow-sm">
                      ✅ Generated Successfully
                    </Badge>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="prose prose-lg max-w-none">
                    <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                      <div className="text-gray-700">
                        {formatMarkdownContent(
                          generatedReviewer.type === 'summary' ? generatedReviewer.content.summary || '' :
                          generatedReviewer.type === 'flashcards' ? `Generated ${generatedReviewer.content.flashcards?.length || 0} flashcards` :
                          `Generated ${generatedReviewer.content.notes?.length || 0} study notes`
                        )}
                      </div>
                    </div>
                </div>
              </div>
            </div>

            {/* Generation Form */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* File Selection */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">Select Document</CardTitle>
                        <CardDescription className="text-blue-700 font-medium">
                          Choose from your uploaded files
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {filesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="ml-3 text-gray-600">Loading files...</span>
                      </div>
                    ) : uploadedFiles.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">No documents found</p>
                        <Link href="/upload">
                          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Document
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-900">Available Documents</Label>
                        <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                          <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select a document..." />
                          </SelectTrigger>
                          <SelectContent>
                            {uploadedFiles.map((file) => (
                              <SelectItem key={file.id} value={file.id}>
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                  <div>
                                    <div className="font-medium">{file.original_name}</div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(file.upload_date).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {selectedFile && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{selectedFile.original_name}</p>
                                <p className="text-sm text-gray-600">
                                  {selectedFile.file_size ? `${Math.round(selectedFile.file_size / 1024)} KB` : 'Size unknown'} • 
                                  {new Date(selectedFile.upload_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Generation Settings */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">Generation Settings</CardTitle>
                        <CardDescription className="text-green-700 font-medium">
                          Customize your study material
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-8">
                    {/* Study Material Type */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold text-gray-900">Study Material Type</Label>
                      <RadioGroup
                        value={reviewerType}
                        onValueChange={(value: "summary" | "flashcards" | "notes") => setReviewerType(value)}
                        className="grid md:grid-cols-3 gap-4"
                      >
                        {[
                          { value: "summary", label: "Summary", icon: FileText, description: "Comprehensive overview of key concepts", color: "blue" },
                          { value: "flashcards", label: "Flashcards", icon: Brain, description: "Interactive Q&A for active recall", color: "green" },
                          { value: "notes", label: "Notes", icon: BookOpen, description: "Organized study points and insights", color: "purple" }
                        ].map((type) => (
                          <div key={type.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                            <Label
                              htmlFor={type.value}
                              className={`flex-1 cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                                reviewerType === type.value
                                  ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg"
                                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  reviewerType === type.value 
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                                    : "bg-gray-100 text-gray-600"
                                }`}>
                                  <type.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900">{type.label}</div>
                                  <div className="text-sm text-gray-600">{type.description}</div>
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* Focus Areas */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold text-gray-900">Focus Areas (Optional)</Label>
                      <p className="text-sm text-gray-600">Select specific areas to emphasize in your study material</p>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {commonFocusAreas.map((area) => (
                          <Button
                            key={area}
                            type="button"
                            variant={focusAreas.includes(area) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFocusAreaToggle(area)}
                            className={`justify-start transition-all duration-200 ${
                              focusAreas.includes(area)
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                                : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            <Target className="mr-2 h-3 w-3" />
                            {area}
                          </Button>
                        ))}
                      </div>

                      {/* Custom Focus Area */}
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add custom focus area..."
                          value={customFocusArea}
                          onChange={(e) => setCustomFocusArea(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addCustomFocusArea()}
                          className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Button
                          type="button"
                          onClick={addCustomFocusArea}
                          disabled={!customFocusArea.trim()}
                          variant="outline"
                          className="border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        >
                          Add
                        </Button>
                      </div>

                      {focusAreas.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {focusAreas.map((area) => (
                            <Badge
                              key={area}
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 cursor-pointer"
                              onClick={() => handleFocusAreaToggle(area)}
                            >
                              {area} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Your Study Material</h3>
                      <p className="text-gray-600">AI is analyzing your document and creating personalized content...</p>
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                      <Progress value={progress} className="h-3" />
                      <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate Button */}
            {!isGenerating && (
              <div className="flex justify-center">
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedFileId || isGenerating}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-12 py-4 text-lg font-semibold"
                >
                  <Sparkles className="mr-3 h-5 w-5" />
                  Generate Study Material
                </Button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 rounded-3xl p-8 text-white shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-indigo-600/80"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse delay-1000"></div>
              <div className="absolute top-1/2 right-1/4 w-20 h-20 bg-white/5 rounded-full blur-lg animate-bounce delay-2000"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <Link href="/library">
                    <Button variant="ghost" className="text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm transition-all duration-300 hover:scale-105">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Library
                    </Button>
                  </Link>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg animate-pulse">
                      <Sparkles className="mr-1 h-3 w-3 animate-spin" />
                      AI Generator
                    </Badge>
                    <Badge className="bg-white/20 text-white border border-white/30 backdrop-blur-sm hover:bg-white/30 transition-all duration-300">
                      Smart Learning
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">Generate Study Materials</h1>
                    <p className="text-blue-100 text-xl leading-relaxed">
                      Transform your documents into personalized learning experiences with AI
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 hover:bg-white/15 transition-all duration-300">
                  <div className="flex flex-wrap items-center gap-6 text-sm text-blue-100">
                    <div className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200">
                      <Brain className="h-5 w-5 text-blue-200 animate-pulse" />
                      <span className="font-medium">AI-powered content analysis</span>
                    </div>
                    <div className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200">
                      <Target className="h-5 w-5 text-blue-200 animate-pulse delay-300" />
                      <span className="font-medium">Customizable focus areas</span>
                    </div>
                    <div className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200">
                      <Settings className="h-5 w-5 text-blue-200 animate-pulse delay-700" />
                      <span className="font-medium">Multiple learning formats</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generation Form */}
            <div className="grid lg:grid-cols-3 gap-8">
              {/* File Selection */}
              <div className="lg:col-span-1">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">Select Document</CardTitle>
                        <CardDescription className="text-blue-700 font-medium">
                          Choose from your uploaded files
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    {filesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                        <span className="ml-3 text-gray-600">Loading files...</span>
                      </div>
                    ) : uploadedFiles.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 mb-4">No documents found</p>
                        <Link href="/upload">
                          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Document
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-900">Available Documents</Label>
                        <Select value={selectedFileId} onValueChange={setSelectedFileId}>
                          <SelectTrigger className="w-full border-gray-200 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder="Select a document..." />
                          </SelectTrigger>
                          <SelectContent>
                            {uploadedFiles.map((file) => (
                              <SelectItem key={file.id} value={file.id}>
                                <div className="flex items-center space-x-3">
                                  <FileText className="h-4 w-4 text-blue-600" />
                                  <div>
                                    <div className="font-medium">{file.original_name}</div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(file.upload_date).toLocaleDateString()}
                                    </div>
                                  </div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {selectedFile && (
                          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <FileText className="w-4 h-4 text-white" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{selectedFile.original_name}</p>
                                <p className="text-sm text-gray-600">
                                  {selectedFile.file_size ? `${Math.round(selectedFile.file_size / 1024)} KB` : 'Size unknown'} • 
                                  {new Date(selectedFile.upload_date).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Generation Settings */}
              <div className="lg:col-span-2">
                <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Settings className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl text-gray-900">Generation Settings</CardTitle>
                        <CardDescription className="text-green-700 font-medium">
                          Customize your study material
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-8">
                    {/* Study Material Type */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold text-gray-900">Study Material Type</Label>
                      <RadioGroup
                        value={reviewerType}
                        onValueChange={(value: "summary" | "flashcards" | "notes") => setReviewerType(value)}
                        className="grid md:grid-cols-3 gap-4"
                      >
                        {[
                          { value: "summary", label: "Summary", icon: FileText, description: "Comprehensive overview of key concepts", color: "blue" },
                          { value: "flashcards", label: "Flashcards", icon: Brain, description: "Interactive Q&A for active recall", color: "green" },
                          { value: "notes", label: "Notes", icon: BookOpen, description: "Organized study points and insights", color: "purple" }
                        ].map((type) => (
                          <div key={type.value} className="flex items-center space-x-3">
                            <RadioGroupItem value={type.value} id={type.value} className="sr-only" />
                            <Label
                              htmlFor={type.value}
                              className={`flex-1 cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                                reviewerType === type.value
                                  ? "border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100 shadow-lg"
                                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                  reviewerType === type.value 
                                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg" 
                                    : "bg-gray-100 text-gray-600"
                                }`}>
                                  <type.icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-semibold text-gray-900">{type.label}</div>
                                  <div className="text-sm text-gray-600">{type.description}</div>
                                </div>
                              </div>
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    <Separator />

                    {/* Focus Areas */}
                    <div className="space-y-4">
                      <Label className="text-base font-semibold text-gray-900">Focus Areas (Optional)</Label>
                      <p className="text-sm text-gray-600">Select specific areas to emphasize in your study material</p>
                      
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {commonFocusAreas.map((area) => (
                          <Button
                            key={area}
                            type="button"
                            variant={focusAreas.includes(area) ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleFocusAreaToggle(area)}
                            className={`justify-start transition-all duration-200 ${
                              focusAreas.includes(area)
                                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                                : "border-gray-200 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            <Target className="mr-2 h-3 w-3" />
                            {area}
                          </Button>
                        ))}
                      </div>

                      {/* Custom Focus Area */}
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add custom focus area..."
                          value={customFocusArea}
                          onChange={(e) => setCustomFocusArea(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && addCustomFocusArea()}
                          className="flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <Button
                          type="button"
                          onClick={addCustomFocusArea}
                          disabled={!customFocusArea.trim()}
                          variant="outline"
                          className="border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                        >
                          Add
                        </Button>
                      </div>

                      {focusAreas.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {focusAreas.map((area) => (
                            <Badge
                              key={area}
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 cursor-pointer"
                              onClick={() => handleFocusAreaToggle(area)}
                            >
                              {area} ×
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Generation Progress */}
            {isGenerating && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">Generating Your Study Material</h3>
                      <p className="text-gray-600">AI is analyzing your document and creating personalized content...</p>
                    </div>
                    <div className="max-w-md mx-auto space-y-2">
                      <Progress value={progress} className="h-3" />
                      <p className="text-sm text-gray-500">{Math.round(progress)}% complete</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate Button */}
            {!isGenerating && (
              <div className="flex justify-center">
                <Button
                  onClick={handleGenerate}
                  disabled={!selectedFileId || isGenerating}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-12 py-4 text-lg font-semibold"
                >
                  <Sparkles className="mr-3 h-5 w-5" />
                  Generate Study Material
                </Button>
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}