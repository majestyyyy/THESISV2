"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Save, X, Check, FileText, Clock, Target } from "lucide-react"
import type { Quiz, QuizQuestion } from "@/lib/quiz-utils"
import { getDifficultyColor, getQuestionTypeLabel } from "@/lib/quiz-utils"

interface QuizPreviewProps {
  quiz: Quiz
  onSave: (quiz: Quiz) => void
  onCancel: () => void
}

export function QuizPreview({ quiz, onSave, onCancel }: QuizPreviewProps) {
  const [editingQuiz, setEditingQuiz] = useState<Quiz>(quiz)
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)

  const updateQuizTitle = (title: string) => {
    setEditingQuiz((prev) => ({ ...prev, title }))
  }

  const updateQuizDescription = (description: string) => {
    setEditingQuiz((prev) => ({ ...prev, description }))
  }

  const updateQuestion = (questionId: string, updates: Partial<QuizQuestion>) => {
    setEditingQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === questionId ? { ...q, ...updates } : q)),
    }))
  }

  const removeQuestion = (questionId: string) => {
    setEditingQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
      totalQuestions: prev.totalQuestions - 1,
    }))
  }

  const handleSave = () => {
    onSave(editingQuiz)
  }

  return (
    <div className="space-y-6">
      {/* Quiz Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-blue-600" />
              <div>
                <Input
                  value={editingQuiz.title}
                  onChange={(e) => updateQuizTitle(e.target.value)}
                  className="text-xl font-bold border-none p-0 h-auto"
                />
                <Textarea
                  value={editingQuiz.description}
                  onChange={(e) => updateQuizDescription(e.target.value)}
                  className="text-gray-600 border-none p-0 resize-none"
                  rows={2}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getDifficultyColor(editingQuiz.difficulty)}>{editingQuiz.difficulty}</Badge>
              <Badge variant="secondary">{editingQuiz.totalQuestions} questions</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-6 text-sm text-gray-600">
            <div className="flex items-center">
              <FileText className="mr-1 h-4 w-4" />
              Source: {editingQuiz.fileName}
            </div>
            <div className="flex items-center">
              <Clock className="mr-1 h-4 w-4" />
              Est. time: {Math.ceil(editingQuiz.totalQuestions * 1.5)} minutes
            </div>
            <div className="flex items-center">
              <Target className="mr-1 h-4 w-4" />
              Difficulty: {editingQuiz.difficulty}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Questions Preview</h3>
        {editingQuiz.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">Question {index + 1}</Badge>
                  <Badge className={getDifficultyColor(question.difficulty)}>
                    {getQuestionTypeLabel(question.questionType)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    return (
                      <Card className="w-full max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto p-4 sm:p-6">
                        <CardHeader>
                          <CardTitle className="text-lg sm:text-xl font-bold">Quiz Preview</CardTitle>
                          <CardDescription className="text-xs sm:text-sm text-gray-600">Review the generated questions before starting the quiz.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 sm:space-y-6">
                          {editingQuiz.questions.map((q, idx) => (
                            <div key={q.id} className="border-b pb-3 sm:pb-4 mb-3 sm:mb-4 last:border-b-0 last:pb-0 last:mb-0">
                              <div className="flex items-center gap-2 mb-1 sm:mb-2 flex-wrap">
                                <span className="font-semibold text-indigo-700">Q{idx + 1}:</span>
                                <span className="text-base sm:text-lg text-gray-900">{q.questionText}</span>
                              </div>
                              {q.options && (
                                <div className="flex flex-wrap gap-2">
                                  {q.options.map((opt, oidx) => (
                                    <Badge key={oidx} className="bg-indigo-100 text-indigo-800 text-xs sm:text-sm">{opt}</Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </CardContent>
                        {/* Removed undefined onStartQuiz and CardFooter for preview */}
                      </Card>
                    )
                  {question.questionType === "multiple_choice" && question.options && (
                    <div>
                      <Label>Answer Options</Label>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div key={optionIndex} className="flex items-center space-x-2">
                            <Input
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...question.options!]
                                newOptions[optionIndex] = e.target.value
                                updateQuestion(question.id, { options: newOptions })
                              }}
                            />
                            <Button
                              variant={option === question.correctAnswer ? "default" : "outline"}
                              size="sm"
                              onClick={() => updateQuestion(question.id, { correctAnswer: option })}
                            >
                              {option === question.correctAnswer ? <Check className="h-4 w-4" /> : "Set as Correct"}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {question.questionType === "true_false" && (
                    <div>
                      <Label>Correct Answer</Label>
                      <div className="flex space-x-2">
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

                  {/* Removed invalid short_answer type check and stray closing parenthesis */}

                  <div>
                    <Label>Explanation (Optional)</Label>
                    <Textarea
                      value={question.explanation || ""}
                      onChange={(e) => updateQuestion(question.id, { explanation: e.target.value })}
                      rows={2}
                      placeholder="Provide an explanation for the correct answer..."
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="font-medium">{question.questionText}</p>

                  {question.questionType === "multiple_choice" && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`p-2 rounded border ${
                            option === question.correctAnswer
                              ? "bg-green-50 border-green-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="font-mono text-sm mr-2">{String.fromCharCode(65 + optionIndex)}.</span>
                            {option}
                            {option === question.correctAnswer && <Check className="ml-2 h-4 w-4 text-green-600" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {question.questionType === "true_false" && (
                    <div className="flex space-x-4">
                      <Badge
                        variant={question.correctAnswer === "True" ? "default" : "secondary"}
                        className={question.correctAnswer === "True" ? "bg-green-100 text-green-800" : ""}
                      >
                        True {question.correctAnswer === "True" && <Check className="ml-1 h-3 w-3" />}
                      </Badge>
                      <Badge
                        variant={question.correctAnswer === "False" ? "default" : "secondary"}
                        className={question.correctAnswer === "False" ? "bg-green-100 text-green-800" : ""}
                      >
                        False {question.correctAnswer === "False" && <Check className="ml-1 h-3 w-3" />}
                      </Badge>
                    </div>
                  )}

                  {/* Removed invalid short_answer type check and stray closing parenthesis */}

                  {question.explanation && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm font-medium text-blue-800 mb-1">Explanation:</p>
                      <p className="text-sm text-blue-700">{question.explanation}</p>
                    </div>
                  )}
                </div>
              
            {/* Fixed JSX closing tag for CardContent */}
          </CardContent>
        </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Quiz
        </Button>
      </div>
    </div>
  )
}
