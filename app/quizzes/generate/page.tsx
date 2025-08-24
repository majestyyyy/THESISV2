"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, CheckCircle, FileText, Upload } from "lucide-react"
import { QuizGenerationForm } from "@/components/quiz/quiz-generation-form"
import { QuizPreview } from "@/components/quiz/quiz-preview"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { generateQuizFromFile, saveQuiz } from "@/lib/quiz-utils"
import { getUserFiles, type FileRecord } from "@/lib/file-utils"
import type { Quiz, QuizGenerationOptions } from "@/lib/quiz-utils"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function GenerateQuizPage() {
  const [uploadedFiles, setUploadedFiles] = useState<FileRecord[]>([])
  const [filesLoading, setFilesLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null)
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
    setGeneratedQuiz(null)

    try {
      const selectedFile = uploadedFiles.find((f) => f.id === options.fileId)
      if (!selectedFile) {
        throw new Error("Selected file not found")
      }

      const quiz = await generateQuizFromFile(options, selectedFile.content_text || "", setGenerationProgress)
      setGeneratedQuiz(quiz)
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
    setGeneratedQuiz(null)
    setGenerationProgress(0)
  }

  if (savedQuiz) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-2xl mx-auto py-16 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Saved Successfully!</h1>
            <p className="text-gray-600 mb-8">Your quiz "{savedQuiz.title}" has been saved and is ready to be taken.</p>
            <div className="space-y-4">
              <Card className="text-left">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{savedQuiz.title}</h3>
                      <p className="text-sm text-gray-600">
                        {savedQuiz.totalQuestions} questions • {savedQuiz.difficulty} difficulty
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Generate AI Quiz</h1>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              Create personalized quizzes from your uploaded study materials using advanced AI technology.
            </p>
          </div>

          {!generatedQuiz && !isGenerating && (
            <div className="max-w-2xl mx-auto">
              {filesLoading ? (
                <Card className="bg-white/80 backdrop-blur-sm border-blue-100 shadow-lg shadow-blue-100/50">
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading your documents...</p>
                    </div>
                  </CardContent>
                </Card>
              ) : uploadedFiles.length === 0 ? (
                <Card className="bg-white/80 backdrop-blur-sm border-purple-100 shadow-lg shadow-purple-100/50">
                  <CardContent className="text-center py-12">
                    <Upload className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">No Documents Available</h3>
                    <p className="text-gray-600 mb-6">
                      You need to upload some documents before you can generate quizzes.
                    </p>
                    <Link href="/upload">
                      <Button className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200/50">
                        <FileText className="w-4 h-4" />
                        <span>Upload Documents</span>
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
            <div className="max-w-2xl mx-auto">
              <Card className="bg-white/80 backdrop-blur-sm border-indigo-100 shadow-lg shadow-indigo-200/50">
                <CardHeader className="text-center">
                  <Brain className="h-12 w-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
                  <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Generating Your Quiz</CardTitle>
                  <CardDescription>AI is analyzing your content and creating personalized questions...</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={generationProgress} className="w-full bg-gradient-to-r from-blue-100 to-purple-100" />
                  <div className="text-center text-sm text-gray-600">
                    {generationProgress < 30 && "Analyzing document content..."}
                    {generationProgress >= 30 && generationProgress < 60 && "Identifying key concepts..."}
                    {generationProgress >= 60 && generationProgress < 90 && "Generating questions..."}
                    {generationProgress >= 90 && "Finalizing quiz..."}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {generatedQuiz && (
            <div className="max-w-4xl mx-auto">
              <Alert className="mb-6 bg-emerald-50 border-emerald-200 text-emerald-800">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertDescription>
                  Quiz generated successfully! Review and edit the questions below, then save your quiz.
                </AlertDescription>
              </Alert>
              <QuizPreview quiz={generatedQuiz} onSave={handleSaveQuiz} onCancel={handleCancelPreview} />
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
