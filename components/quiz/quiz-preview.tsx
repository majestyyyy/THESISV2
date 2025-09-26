"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Quiz, QuizQuestion } from "@/lib/quiz-utils"
import { 
  Edit, 
  Save, 
  X, 
  Check, 
  FileText, 
  Clock, 
  Target, 
  Volume2, 
  Plus,
  Minus,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  Copy,
  Trash2
} from "lucide-react"

// Text-to-speech helper
const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text)
    speechSynthesis.speak(utterance)
  }
}

interface QuizPreviewProps {
  quiz: Quiz
  onSave: (quiz: Quiz) => void
  onCancel: () => void
}

export default function QuizPreview({ quiz, onSave, onCancel }: QuizPreviewProps) {
  const [editingQuiz, setEditingQuiz] = useState<Quiz>(quiz)
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Save with Ctrl+S (or Cmd+S on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (Object.keys(validationErrors).length === 0) {
          handleSave()
        }
      }
      
      // Cancel with Escape
      if (e.key === 'Escape') {
        if (editingQuestionId) {
          setEditingQuestionId(null)
        } else {
          onCancel()
        }
      }
      
      // Quick edit with 'E' key (when not in input)
      if (e.key === 'e' && !e.ctrlKey && !e.metaKey && !(e.target as HTMLElement).matches('input, textarea')) {
        const currentIndex = editingQuiz.questions.findIndex(q => q.id === editingQuestionId)
        if (currentIndex === -1 && editingQuiz.questions.length > 0) {
          setEditingQuestionId(editingQuiz.questions[0].id)
        }
      }
    }

    document.addEventListener('keydown', handleKeyboard)
    return () => document.removeEventListener('keydown', handleKeyboard)
  }, [editingQuestionId, validationErrors, editingQuiz.questions, onCancel])

  // Auto-save effect
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        setAutoSaveStatus('saving')
        // Simulate auto-save
        setTimeout(() => {
          setAutoSaveStatus('saved')
          setHasUnsavedChanges(false)
          setTimeout(() => setAutoSaveStatus('idle'), 2000)
        }, 500)
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [hasUnsavedChanges, editingQuiz])

  // Validation function
  const validateQuestion = useCallback((question: QuizQuestion): string[] => {
    const errors: string[] = []
    
    if (!question.questionText.trim()) {
      errors.push("Question text is required")
    }
    
    if (question.questionType === "multiple_choice") {
      if (!question.options || question.options.length < 2) {
        errors.push("Multiple choice questions need at least 2 options")
      }
      if (question.options && !question.options.includes(question.correctAnswer)) {
        errors.push("Correct answer must be one of the options")
      }
    }
    
    if (!question.correctAnswer.trim()) {
      errors.push("Correct answer is required")
    }
    
    return errors
  }, [])

  // Update validation errors when questions change
  useEffect(() => {
    const newErrors: Record<string, string[]> = {}
    editingQuiz.questions.forEach(question => {
      const errors = validateQuestion(question)
      if (errors.length > 0) {
        newErrors[question.id] = errors
      }
    })
    setValidationErrors(newErrors)
  }, [editingQuiz.questions, validateQuestion])

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    setHasUnsavedChanges(true)
    setEditingQuiz(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }))
  }

  const addOption = (questionId: string) => {
    const question = editingQuiz.questions.find(q => q.id === questionId)
    if (question && question.options) {
      const newOptions = [...question.options, `Option ${question.options.length + 1}`]
      updateQuestion(questionId, { options: newOptions })
    }
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    const question = editingQuiz.questions.find(q => q.id === questionId)
    if (question && question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, index) => index !== optionIndex)
      const updates: Partial<QuizQuestion> = { options: newOptions }
      
      // If the removed option was the correct answer, reset correct answer
      if (question.correctAnswer === question.options[optionIndex]) {
        updates.correctAnswer = newOptions[0] || ""
      }
      
      updateQuestion(questionId, updates)
    }
  }

  const duplicateQuestion = (questionId: string) => {
    const question = editingQuiz.questions.find(q => q.id === questionId)
    if (question) {
      const newQuestion: QuizQuestion = {
        ...question,
        id: `q${Date.now()}`,
        questionText: `${question.questionText} (Copy)`
      }
      
      setEditingQuiz(prev => ({
        ...prev,
        questions: [...prev.questions, newQuestion],
        totalQuestions: prev.totalQuestions + 1
      }))
      setHasUnsavedChanges(true)
    }
  }

  const moveQuestion = (fromIndex: number, toIndex: number) => {
    const newQuestions = [...editingQuiz.questions]
    const [movedQuestion] = newQuestions.splice(fromIndex, 1)
    newQuestions.splice(toIndex, 0, movedQuestion)
    
    setEditingQuiz(prev => ({
      ...prev,
      questions: newQuestions
    }))
    setHasUnsavedChanges(true)
  }

  const deleteQuestion = (questionId: string) => {
    if (editingQuiz.questions.length <= 1) {
      alert("Cannot delete the last question. A quiz must have at least one question.")
      return
    }
    
    if (confirm("Are you sure you want to delete this question?")) {
      setEditingQuiz(prev => ({
        ...prev,
        questions: prev.questions.filter(q => q.id !== questionId),
        totalQuestions: prev.totalQuestions - 1
      }))
      setHasUnsavedChanges(true)
      
      // Close editing if this question was being edited
      if (editingQuestionId === questionId) {
        setEditingQuestionId(null)
      }
    }
  }

  const handleSave = () => {
    onSave(editingQuiz)
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header with Auto-save Status */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
          <Check className="w-8 h-8 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Review Your Generated Quiz
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Review and customize your AI-generated quiz before saving. Edit questions, answers, and explanations as needed.
          </p>
          
          {/* Auto-save Status */}
          <div className="flex items-center justify-center space-x-2 mt-3">
            {autoSaveStatus === 'saving' && (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                <span className="text-sm text-blue-600">Auto-saving...</span>
              </>
            )}
            {autoSaveStatus === 'saved' && (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Changes saved</span>
              </>
            )}
            {hasUnsavedChanges && autoSaveStatus === 'idle' && (
              <>
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-600">Unsaved changes</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Quiz Info Cards */}
    

      {/* Enhanced Questions Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center space-x-3 bg-gradient-to-r from-indigo-100 to-purple-100 px-6 py-3 rounded-full border border-indigo-200">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-indigo-800">Generated Questions</h3>
          </div>
        </div>
        {editingQuiz.questions.map((question, index) => {
          const hasErrors = validationErrors[question.id]?.length > 0
          const isEditing = editingQuestionId === question.id
          
          return (
            <Card 
              key={question.id} 
              className={`shadow-lg hover:shadow-xl transition-all duration-300 border-l-4 ${
                hasErrors ? 'border-l-red-500 bg-gradient-to-r from-red-50/50 to-white' :
                isEditing ? 'border-l-blue-500 bg-gradient-to-r from-blue-50/50 to-white' :
                'border-l-green-500 bg-gradient-to-r from-white to-green-50/30'
              }`}
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="cursor-grab hover:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
                        onMouseDown={() => setDraggedQuestionId(question.id)}
                      >
                        <GripVertical className="h-4 w-4" />
                      </Button>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md font-bold text-white ${
                        hasErrors ? 'bg-gradient-to-br from-red-500 to-red-600' :
                        isEditing ? 'bg-gradient-to-br from-blue-500 to-indigo-600' :
                        'bg-gradient-to-br from-green-500 to-emerald-600'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                        Question {index + 1}
                        {hasErrors && <AlertCircle className="w-4 h-4 text-red-500 ml-2" />}
                        {isEditing && <Edit className="w-4 h-4 text-blue-500 ml-2" />}
                      </CardTitle>
                      {hasErrors && (
                        <div className="text-sm text-red-600 mt-1">
                          {validationErrors[question.id][0]}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakText(question.questionText)}
                      className="text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      title="Read question aloud"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteQuestion(question.id)}
                      className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                      title="Delete question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={isEditing ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setEditingQuestionId(isEditing ? null : question.id)}
                      className={isEditing ? 
                        "bg-blue-600 hover:bg-blue-700 text-white" : 
                        "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
                      }
                      title={isEditing ? "Stop editing" : "Edit question"}
                    >
                      {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
              {editingQuestionId === question.id ? (
                <div className="space-y-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-900 flex items-center">
                      <Edit className="w-4 h-4 mr-2 text-blue-600" />
                      Question Text
                    </Label>
                    <Textarea
                      value={question.questionText}
                      onChange={(e) => updateQuestion(question.id, { questionText: e.target.value })}
                      className="min-h-[100px] border-gray-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                      placeholder="Enter your question..."
                    />
                  </div>
                  
                  {question.questionType === "multiple_choice" && question.options && (
                    <div>
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-semibold text-gray-900">Options</Label>

                      </div>
                      <div className="space-y-3 mt-3">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2 group">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                              {String.fromCharCode(65 + optionIndex)}
                            </div>
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options!]
                                newOptions[optionIndex] = e.target.value
                                updateQuestion(question.id, { options: newOptions })
                              }}
                              className="flex-1 bg-white/80 backdrop-blur-sm"
                              placeholder={`Option ${String.fromCharCode(65 + optionIndex)}`}
                            />
                            <Button
                              variant={option === question.correctAnswer ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateQuestion(question.id, { correctAnswer: option })}
                              className={option === question.correctAnswer ? 
                                "bg-green-600 hover:bg-green-700 text-white" : 
                                "text-green-600 hover:text-green-700 hover:bg-green-50"
                              }
                            >
                              {option === question.correctAnswer ? (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Correct
                                </>
                              ) : (
                                "Mark Correct"
                              )}
                            </Button>
                            {question.options && question.options.length > 2 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeOption(question.id, optionIndex)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {question.options && question.options.length < 6 && (
                          <div className="text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => addOption(question.id)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-2 border-dashed border-blue-300 hover:border-blue-400 w-full py-6"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Another Option
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {question.questionType === "true_false" && (
                    <div>
                      <Label>Correct Answer</Label>
                      <div className="flex space-x-2 mt-1">
                        <Button
                          variant={question.correctAnswer === "True" ? "default" : "outline"}
                          onClick={() => updateQuestion(question.id, { correctAnswer: "True" })}
                        >
                          True
                        </Button>
                        <Button
                          variant={question.correctAnswer === "False" ? "default" : "outline"}
                          onClick={() => updateQuestion(question.id, { correctAnswer: "False" })}
                        >
                          False
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label className="text-base font-semibold text-gray-900 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Explanation (Optional)
                    </Label>
                    <Textarea
                      value={question.explanation || ""}
                      onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                      className="min-h-[80px] border-gray-200 focus:border-blue-500 bg-white/80 backdrop-blur-sm"
                      placeholder="Add an explanation to help students understand the correct answer..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-900 font-medium">{question.questionText}</p>
                  
                  {question.questionType === "multiple_choice" && question.options && (
                    <div className="space-y-1">
                      {question.options.map((option, optionIndex) => (
                        <div 
                          key={optionIndex} 
                          className={`p-2 rounded ${
                            option === question.correctAnswer 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-50 text-gray-700'
                          }`}
                        >
                          {String.fromCharCode(65 + optionIndex)}. {option}
                          {option === question.correctAnswer && (
                            <Check className="w-4 h-4 inline ml-2" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {question.questionType === "true_false" && (
                    <div className="flex space-x-2">
                      <div className={`p-2 rounded ${
                        question.correctAnswer === "True" 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-50 text-gray-700'
                      }`}>
                        True {question.correctAnswer === "True" && <Check className="w-4 h-4 inline ml-1" />}
                      </div>
                      <div className={`p-2 rounded ${
                        question.correctAnswer === "False" 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-50 text-gray-700'
                      }`}>
                        False {question.correctAnswer === "False" && <Check className="w-4 h-4 inline ml-1" />}
                      </div>
                    </div>
                  )}

                  {question.explanation && (
                    <div className="p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm font-medium text-blue-800">Explanation:</p>
                      <p className="text-sm text-blue-700">{question.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          )
        })}
      </div>

      {/* Enhanced Actions */}
      <div className="space-y-4">
        {/* Validation Summary */}
        {Object.keys(validationErrors).length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <h3 className="font-semibold text-red-800">Fix These Issues Before Saving</h3>
            </div>
            <ul className="space-y-1 text-sm text-red-700">
              {Object.entries(validationErrors).map(([questionId, errors]) => {
                const questionIndex = editingQuiz.questions.findIndex(q => q.id === questionId) + 1
                return errors.map((error, index) => (
                  <li key={`${questionId}-${index}`} className="flex items-center space-x-2">
                    <span className="w-6 h-6 bg-red-200 rounded-full flex items-center justify-center text-xs font-medium">
                      {questionIndex}
                    </span>
                    <span>{error}</span>
                  </li>
                ))
              })}
            </ul>
          </div>
        )}


        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              onClick={onCancel}
              className="px-6 py-2 hover:bg-gray-50"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            {hasUnsavedChanges && (
              <div className="text-sm text-amber-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                You have unsaved changes
              </div>
            )}
          </div>
          
          <Button 
            onClick={handleSave}
            disabled={Object.keys(validationErrors).length > 0}
            className={`px-8 py-3 shadow-lg transition-all duration-200 ${
              Object.keys(validationErrors).length > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white hover:shadow-xl'
            }`}
          >
            <Save className="mr-2 h-4 w-4" />
            {Object.keys(validationErrors).length > 0 ? 'Fix Issues First' : 'Save Quiz'}
          </Button>
        </div>
        
      </div>
    </div>
  )
}