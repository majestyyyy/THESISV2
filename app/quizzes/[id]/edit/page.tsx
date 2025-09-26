"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Save, ArrowLeft, Plus, Trash2, Edit3 } from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { getQuizById, updateQuiz, type Quiz, type QuizQuestion } from "@/lib/quiz-utils"
import { toast } from "sonner"
import Link from "next/link"

export default function EditQuizPage() {
  const router = useRouter()
  const params = useParams()
  const quizId = params.id as string

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [editedQuiz, setEditedQuiz] = useState<Partial<Quiz>>({})

  useEffect(() => {
    async function loadQuiz() {
      try {
        const quizData = await getQuizById(quizId)
        if (quizData) {
          setQuiz(quizData)
          setEditedQuiz({
            title: quizData.title,
            description: quizData.description,
            difficulty: quizData.difficulty,
            questions: [...quizData.questions]
          })
        } else {
          toast.error("Quiz not found")
          router.push("/quizzes")
        }
      } catch (error) {
        console.error("Error loading quiz:", error)
        toast.error("Failed to load quiz")
        router.push("/quizzes")
      } finally {
        setIsLoading(false)
      }
    }

    if (quizId) {
      loadQuiz()
    }
  }, [quizId, router])

  const handleSave = async () => {
    if (!quiz || !editedQuiz.questions || editedQuiz.questions.length === 0) {
      toast.error("Quiz must have at least one question")
      return
    }

    setIsSaving(true)
    try {
      const success = await updateQuiz(quizId, editedQuiz)
      if (success) {
        toast.success("Quiz updated successfully!")
        router.push("/quizzes")
      } else {
        toast.error("Failed to update quiz")
      }
    } catch (error) {
      console.error("Error updating quiz:", error)
      toast.error("Failed to update quiz")
    } finally {
      setIsSaving(false)
    }
  }

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    if (!editedQuiz.questions) return
    
    const updatedQuestions = [...editedQuiz.questions]
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value }
    setEditedQuiz({ ...editedQuiz, questions: updatedQuestions })
  }

  const addOption = (questionIndex: number) => {
    if (!editedQuiz.questions) return
    
    const updatedQuestions = [...editedQuiz.questions]
    const question = updatedQuestions[questionIndex]
    if (question.options) {
      question.options = [...question.options, ""]
    } else {
      question.options = [""]
    }
    setEditedQuiz({ ...editedQuiz, questions: updatedQuestions })
  }

  const removeOption = (questionIndex: number, optionIndex: number) => {
    if (!editedQuiz.questions) return
    
    const updatedQuestions = [...editedQuiz.questions]
    const question = updatedQuestions[questionIndex]
    if (question.options && question.options.length > 2) {
      question.options = question.options.filter((_, i) => i !== optionIndex)
      setEditedQuiz({ ...editedQuiz, questions: updatedQuestions })
    }
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    if (!editedQuiz.questions) return
    
    const updatedQuestions = [...editedQuiz.questions]
    const question = updatedQuestions[questionIndex]
    if (question.options) {
      question.options[optionIndex] = value
      setEditedQuiz({ ...editedQuiz, questions: updatedQuestions })
    }
  }

  const removeQuestion = (index: number) => {
    if (!editedQuiz.questions || editedQuiz.questions.length <= 1) {
      toast.error("Quiz must have at least one question")
      return
    }
    
    const updatedQuestions = editedQuiz.questions.filter((_, i) => i !== index)
    setEditedQuiz({ ...editedQuiz, questions: updatedQuestions })
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-6 p-6">
            <div className="bg-white/90 backdrop-blur-sm border border-blue-200 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Quiz</h3>
              <p className="text-gray-600">Please wait while we load the quiz data...</p>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!quiz || !editedQuiz.questions) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-6 p-6">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Quiz Not Found</h3>
              <p className="text-red-600 mb-4">The quiz you're trying to edit could not be found.</p>
              <Link href="/quizzes">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Back to Quizzes
                </Button>
              </Link>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8 p-6 max-w-4xl mx-auto">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-2xl border border-blue-200 shadow-lg shadow-blue-100/50 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
              {/* Left Section */}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Link href="/quizzes">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-white/80 backdrop-blur-sm border-blue-200 text-blue-700 hover:bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
               
              </div>

              {/* Right Section */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                {/* Quiz Info Badge */}
               
                
                {/* Save Button */}
                <Button 
                  onClick={handleSave} 
                  disabled={isSaving}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all duration-200 px-6 py-2.5 font-semibold"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      <span>Save Changes</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Progress/Status Bar */}
            <div className="mt-4 pt-4 border-t border-blue-200/50">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4 text-blue-600">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Editing Mode</span>
                  </div>
                  <div className="text-blue-500">
                    Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quiz Basic Info */}
          <Card className="bg-white/90 backdrop-blur-sm border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Quiz Information</CardTitle>
              <CardDescription>Update the basic details of your quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <Input
                  value={editedQuiz.title || ""}
                  onChange={(e) => setEditedQuiz({ ...editedQuiz, title: e.target.value })}
                  placeholder="Enter quiz title"
                  className="border-blue-200 focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <Textarea
                  value={editedQuiz.description || ""}
                  onChange={(e) => setEditedQuiz({ ...editedQuiz, description: e.target.value })}
                  placeholder="Enter quiz description"
                  className="border-blue-200 focus:border-blue-400"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
                <Select
                  value={editedQuiz.difficulty}
                  onValueChange={(value: "easy" | "medium" | "hard") => setEditedQuiz({ ...editedQuiz, difficulty: value })}
                >
                  <SelectTrigger className="border-blue-200 focus:border-blue-400">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-900">Questions ({editedQuiz.questions.length})</h2>
            </div>

            {editedQuiz.questions.map((question, questionIndex) => (
              <Card key={question.id} className="bg-white/90 backdrop-blur-sm border-blue-200">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-blue-900">Question {questionIndex + 1}</CardTitle>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-blue-700 border-blue-200">
                        {question.questionType.replace('_', ' ')}
                      </Badge>
                      {editedQuiz.questions && editedQuiz.questions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeQuestion(questionIndex)}
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Question Text</label>
                    <Textarea
                      value={question.questionText}
                      onChange={(e) => updateQuestion(questionIndex, 'questionText', e.target.value)}
                      className="border-blue-200 focus:border-blue-400"
                      rows={2}
                    />
                  </div>

                  {question.questionType === 'multiple_choice' && question.options && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Answer Options (Select the correct one)</label>
                      <RadioGroup
                        value={question.correctAnswer}
                        onValueChange={(value) => updateQuestion(questionIndex, 'correctAnswer', value)}
                        className="space-y-3"
                      >
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                            question.correctAnswer === option 
                              ? 'border-blue-300 bg-blue-50 shadow-sm' 
                              : 'border-gray-200 hover:border-blue-200'
                          }`}>
                            <RadioGroupItem 
                              value={option} 
                              id={`q${questionIndex}-option${optionIndex}`} 
                              className="text-blue-600 mt-1" 
                            />
                            <div className="flex-1">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 transition-all"
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              {question.correctAnswer === option && (
                                <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                                  Correct
                                </Badge>
                              )}
                              {question.options && question.options.length > 2 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeOption(questionIndex, optionIndex)}
                                  className="text-red-600 hover:bg-red-50 px-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </RadioGroup>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(questionIndex)}
                        className="border-blue-200 text-blue-600 hover:bg-blue-50 mt-3"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    </div>
                  )}

                  {question.questionType === 'true_false' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">Select the correct answer</label>
                      <RadioGroup
                        value={question.correctAnswer}
                        onValueChange={(value) => updateQuestion(questionIndex, 'correctAnswer', value)}
                        className="space-y-3"
                      >
                        <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                          question.correctAnswer === "True" 
                            ? 'border-blue-300 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 hover:border-blue-200'
                        }`}>
                          <RadioGroupItem value="True" id={`q${questionIndex}-true`} className="text-blue-600" />
                          <Label htmlFor={`q${questionIndex}-true`} className="flex-1 cursor-pointer text-sm font-medium">
                            True
                          </Label>
                          {question.correctAnswer === "True" && (
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                              Correct
                            </Badge>
                          )}
                        </div>
                        <div className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 ${
                          question.correctAnswer === "False" 
                            ? 'border-blue-300 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 hover:border-blue-200'
                        }`}>
                          <RadioGroupItem value="False" id={`q${questionIndex}-false`} className="text-blue-600" />
                          <Label htmlFor={`q${questionIndex}-false`} className="flex-1 cursor-pointer text-sm font-medium">
                            False
                          </Label>
                          {question.correctAnswer === "False" && (
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                              Correct
                            </Badge>
                          )}
                        </div>
                      </RadioGroup>
                    </div>
                  )}

                  {question.questionType !== 'multiple_choice' && question.questionType !== 'true_false' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Correct Answer</label>
                      <Input
                        value={question.correctAnswer}
                        onChange={(e) => updateQuestion(questionIndex, 'correctAnswer', e.target.value)}
                        placeholder="Enter correct answer"
                        className="border-blue-200 focus:border-blue-400"
                      />
                    </div>
                  )}

                  {question.explanation && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Explanation (Optional)</label>
                      <Textarea
                        value={question.explanation}
                        onChange={(e) => updateQuestion(questionIndex, 'explanation', e.target.value)}
                        placeholder="Explain why this is the correct answer"
                        className="border-blue-200 focus:border-blue-400"
                        rows={2}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}