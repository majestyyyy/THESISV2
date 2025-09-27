"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Brain, CheckCircle, FileText, Upload, ArrowLeft, Sparkles, Target, Settings, Zap, Eye, Save, RefreshCw } from "lucide-react"
import Image from "next/image"
import { QuizGenerationForm } from "@/components/quiz/quiz-generation-form"
import QuizPreview from "@/components/quiz/quiz-preview"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { generateQuizFromFile, saveQuiz } from "@/lib/quiz-utils"
import { getUserFiles, type FileRecord } from "@/lib/file-utils"
import type { Quiz, QuizGenerationOptions } from "@/lib/quiz-utils"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR, { mutate } from "swr"

const fetchGeneratedQuiz = async () => {
  // Replace with your actual generation logic
  // Example: return await generateQuizFromGemini()
}

export default function GenerateQuizPage() {
  const [uploadedFiles, setUploadedFiles] = useState<FileRecord[]>([])
  const [filesLoading, setFilesLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [savedQuiz, setSavedQuiz] = useState<Quiz | null>(null)
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    if (!isHydrated) return // Wait for hydration
    loadUserFiles()
  }, [isHydrated])

  const loadUserFiles = async () => {
    try {
      setFilesLoading(true)
      
      // Add a small delay to ensure proper client-side initialization
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log("Loading user files...")
      
      const files = await getUserFiles()
      setUploadedFiles(files)
      
      console.log("Files loaded successfully:", files.length)
      
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setFilesLoading(false)
    }
  }

  const handleGenerate = async (options: QuizGenerationOptions) => {
    setIsGenerating(true)
    setGenerationProgress(0)

    try {
      const selectedFile = uploadedFiles.find((f) => f.id === options.fileId)
      if (!selectedFile) {
        throw new Error("Selected file not found")
      }

      const quiz = await generateQuizFromFile(options, selectedFile.content_text || "", setGenerationProgress)
      
      // Manually trigger a revalidation for the generated quiz
      mutate("generatedQuiz", quiz, false)
    } catch (error) {
      console.error("Failed to generate quiz:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveQuiz = async (quiz: Quiz) => {
    try {
      console.log("Saving quiz:", quiz)
      const savedQuiz = await saveQuiz(quiz)
      setSavedQuiz(savedQuiz)

      setTimeout(() => {
        router.push("/quizzes")
      }, 1500)
    } catch (error) {
      console.error("Failed to save quiz:", error)
      // You might want to show an error message to the user here
    }
  }

  const handleCancelPreview = () => {
    const hasUnsavedChanges = true // We'll improve this logic if needed
    
    // Show confirmation if there might be unsaved changes
    const shouldCancel = window.confirm(
      "Are you sure you want to cancel? Any changes to the quiz will be lost."
    )
    
    if (shouldCancel) {
      // Clear the generated quiz from cache
      mutate("generatedQuiz", null, false)
      setGenerationProgress(0)
    }
  }

  const { data: generatedQuiz, error } = useSWR("generatedQuiz", fetchGeneratedQuiz, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    onError: (err) => {
      console.error("Quiz generation error:", err)
    },
  })

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <p className="text-red-600">{error.message || "Failed to generate quiz."}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
      </div>
    )
  }

  if (savedQuiz) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 p-3 sm:p-0">
            <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Success Header */}
              <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-emerald-700 to-green-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/80 to-emerald-600/80"></div>
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
                
                <div className="relative z-10 text-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 backdrop-blur-sm border border-white/30">
                    <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4">Quiz Successfully Created!</h1>
                  <p className="text-green-100 text-sm sm:text-base lg:text-lg mb-4 sm:mb-6">
                    Your AI-generated quiz "{savedQuiz.title}" is ready for learning
                  </p>
                  
                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-green-100">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-200" />
                      <span>{savedQuiz.totalQuestions} AI-crafted questions</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-200" />
                      <span>{savedQuiz.difficulty} difficulty level</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-200" />
                      <span>Optimized for learning</span>
                    </div>
                  </div>
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-3 sm:p-0">
          <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-white shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-indigo-600/80"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
                  <Link href="/quizzes">
                    <Button variant="ghost" className="text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm text-sm self-start">
                      <ArrowLeft className="mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      Back to Quizzes
                    </Button>
                  </Link>
                  
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <Badge className="bg-blue-500 text-white shadow-lg text-xs sm:text-sm">
                      <Brain className="mr-1 h-3 w-3" />
                      AI Quiz Generator
                    </Badge>
                    <Badge className="bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                      Smart Testing
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Zap className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">Generate AI Quiz</h1>
                    <p className="text-blue-100 text-lg">
                      Generate questions from your study materials
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-blue-200" />
                      <span>AI-powered question generation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="h-4 w-4 text-blue-200" />
                      <span>Customizable difficulty levels</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Settings className="h-4 w-4 text-blue-200" />
                      <span>Multiple question types</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!generatedQuiz && !isGenerating && (
              <div className="max-w-6xl mx-auto">
                {filesLoading ? (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="flex items-center justify-center py-16">
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">Loading Documents</h3>
                          <p className="text-gray-600">Fetching your uploaded files...</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : uploadedFiles.length === 0 ? (
                  <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                    <CardContent className="text-center py-16">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Upload className="h-10 w-10 text-blue-600" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">No Documents Available</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Upload some study materials to get started with AI-powered quiz generation.
                      </p>
                      <Link href="/upload">
                        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3 text-lg">
                          <Upload className="mr-2 h-5 w-5" />
                          Upload Documents
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  <QuizGenerationForm 
                    files={uploadedFiles.map(file => ({
                      id: file.id,
                      name: file.original_name,
                      extractedText: file.content_text || ""
                    }))} 
                    onGenerate={handleGenerate} 
                    isGenerating={isGenerating} 
                  />
                )}
              </div>
            )}

            {isGenerating && (
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm max-w-4xl mx-auto">
                <CardContent className="p-8">
                  <div className="text-center space-y-8">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 animate-pulse to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                        <Brain className="w-10 h-10 text-white" />
                      </div>
                  
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">AI is Crafting Your Quiz</h3>
                      <p className="text-gray-600 text-lg">
                        Analyzing your content and generating questions...
                      </p>
                    </div>
                    <div className="max-w-lg mx-auto space-y-4">
                      <Progress value={generationProgress} className="h-4 bg-gradient-to-r from-blue-100 to-indigo-100" />
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900 mb-2">{Math.round(generationProgress)}% Complete</div>
                        <div className="text-sm text-gray-600">
                          {generationProgress < 25 && "📄 Analyzing document content..."}
                          {generationProgress >= 25 && generationProgress < 50 && "🔍 Identifying key concepts..."}
                          {generationProgress >= 50 && generationProgress < 75 && "❓ Generating questions..."}
                          {generationProgress >= 75 && generationProgress < 95 && "⚡ Optimizing difficulty..."}
                          {generationProgress >= 95 && "✨ Finalizing your quiz..."}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {generatedQuiz ? (
              <div className="max-w-6xl mx-auto space-y-6">
                {generatedQuiz && (
                  <QuizPreview quiz={generatedQuiz} onSave={handleSaveQuiz} onCancel={handleCancelPreview} />
                )}
              </div>
            ) : null}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
