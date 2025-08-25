"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, EyeOff, Lightbulb } from "lucide-react"
import { useState } from "react"
import type { QuizQuestion } from "@/lib/quiz-utils"
import { getQuestionTypeLabel } from "@/lib/quiz-utils"

interface QuestionDisplayProps {
  question: QuizQuestion
  questionNumber: number
  totalQuestions: number
  selectedAnswer: string
  onAnswerChange: (answer: string) => void
  showExplanation?: boolean
  isCorrect?: boolean
  // TTS props
  isSpeaking?: boolean
  onPlayTTS?: () => void
  onStopTTS?: () => void
}

export function QuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerChange,
  showExplanation = false,
  isCorrect,
  isSpeaking,
  onPlayTTS,
  onStopTTS,
}: QuestionDisplayProps) {
  const [isFlashcardFlipped, setIsFlashcardFlipped] = useState(false)
  const [showHints, setShowHints] = useState(false)
  const [fillInBlanks, setFillInBlanks] = useState<string[]>(
    question.blanks ? new Array(question.blanks.length).fill("") : [],
  )

  const handleBlankChange = (index: number, value: string) => {
    const newBlanks = [...fillInBlanks]
    newBlanks[index] = value
    setFillInBlanks(newBlanks)
    onAnswerChange(newBlanks.join(", "))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              Question {questionNumber} of {totalQuestions}
            </Badge>
            <Badge variant="secondary">{getQuestionTypeLabel(question.questionType)}</Badge>
          </div>
          {showExplanation && (
            <Badge className={isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
              {isCorrect ? "Correct" : "Incorrect"}
            </Badge>
          )}
        </div>
        <CardTitle className="text-lg">{question.questionText}</CardTitle>
        {/* TTS Listen Button for Question (matches quiz preview) */}
        {onPlayTTS && (
          <div className="flex items-center mt-2 mb-2">
            <button
              type="button"
              onClick={isSpeaking ? onStopTTS : onPlayTTS}
              className="p-2 rounded-full hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label={isSpeaking ? 'Stop listening' : 'Listen to question'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isSpeaking ? 'text-red-600' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5v14l-7-7m8.5-4.5a5 5 0 010 9" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 12a7 7 0 00-7-7" />
              </svg>
            </button>
            <span className="ml-2 text-gray-500 text-sm">{isSpeaking ? 'Playing...' : 'Listen to question'}</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Multiple Choice Questions */}
        {question.questionType === "multiple_choice" && question.options && (
          <RadioGroup value={selectedAnswer} onValueChange={onAnswerChange} disabled={showExplanation}>
            <div className="space-y-3">
              {question.options.map((option, index) => (
                <div
                  key={index}
                  className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    showExplanation
                      ? option === question.correctAnswer
                        ? "bg-green-50 border-green-200"
                        : option === selectedAnswer && option !== question.correctAnswer
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50 border-gray-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    <span className="font-mono text-sm mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                    {showExplanation && option === question.correctAnswer && (
                      <Badge className="ml-2 bg-green-100 text-green-800">Correct Answer</Badge>
                    )}
                    {showExplanation && option === selectedAnswer && option !== question.correctAnswer && (
                      <Badge className="ml-2 bg-red-100 text-red-800">Your Answer</Badge>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {/* True/False Questions */}
        {question.questionType === "true_false" && (
          <RadioGroup value={selectedAnswer} onValueChange={onAnswerChange} disabled={showExplanation}>
            <div className="space-y-3">
              {["True", "False"].map((option) => (
                <div
                  key={option}
                  className={`flex items-center space-x-2 p-3 rounded-lg border ${
                    showExplanation
                      ? option === question.correctAnswer
                        ? "bg-green-50 border-green-200"
                        : option === selectedAnswer && option !== question.correctAnswer
                          ? "bg-red-50 border-red-200"
                          : "bg-gray-50 border-gray-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="flex-1 cursor-pointer">
                    {option}
                    {showExplanation && option === question.correctAnswer && (
                      <Badge className="ml-2 bg-green-100 text-green-800">Correct Answer</Badge>
                    )}
                    {showExplanation && option === selectedAnswer && option !== question.correctAnswer && (
                      <Badge className="ml-2 bg-red-100 text-red-800">Your Answer</Badge>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        )}

        {question.questionType === "identification" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identification">Your Answer:</Label>
              <Input
                id="identification"
                value={selectedAnswer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="Enter the term or concept..."
                disabled={showExplanation}
                className={
                  showExplanation
                    ? (() => {
                        // Use the same logic as quiz scoring for visual feedback
                        const normalizedUserAnswer = selectedAnswer.toLowerCase().trim()
                        const normalizedCorrectAnswer = question.correctAnswer.toLowerCase().trim()
                        
                        let isCorrect = normalizedUserAnswer === normalizedCorrectAnswer
                        
                        // Check for partial matches
                        if (!isCorrect && normalizedCorrectAnswer.includes(' ')) {
                          const correctWords = normalizedCorrectAnswer.split(' ').filter((word: string) => word.length > 2)
                          const userWords = normalizedUserAnswer.split(' ').filter((word: string) => word.length > 2)
                          
                          if (correctWords.some((word: string) => userWords.includes(word)) && userWords.length > 0) {
                            isCorrect = true
                          }
                        }
                        
                        return isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                      })()
                    : ""
                }
              />
            </div>
            
            {/* Show user answer vs correct answer comparison in review mode */}
            {showExplanation && (
              <div className="space-y-3">
                {selectedAnswer && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-1">Your Answer:</h4>
                    <p className="text-gray-800">{selectedAnswer || "No answer provided"}</p>
                  </div>
                )}
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-1">Correct Answer:</h4>
                  <p className="text-green-800">{question.correctAnswer}</p>
                </div>
              </div>
            )}
            
            {question.hints && !showExplanation && (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center space-x-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  <span>{showHints ? "Hide Hints" : "Show Hints"}</span>
                </Button>
                {showHints && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium text-yellow-800 mb-2">Hints:</p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {question.hints.map((hint, index) => (
                        <li key={index}>• {hint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {question.questionType === "fill_in_blanks" && question.blanks && (
          <div className="space-y-4">
            <Label>Fill in the blanks:</Label>
            <div className="space-y-3">
              {question.blanks.map((blank, index) => (
                <div key={index} className="space-y-2">
                  <Label htmlFor={`blank-${index}`} className="text-sm font-medium">
                    Blank {index + 1}:
                  </Label>
                  <Input
                    id={`blank-${index}`}
                    value={fillInBlanks[index] || ""}
                    onChange={(e) => handleBlankChange(index, e.target.value)}
                    placeholder={`Enter answer for blank ${index + 1}...`}
                    disabled={showExplanation}
                    className={
                      showExplanation
                        ? fillInBlanks[index]?.toLowerCase().trim() === blank.toLowerCase().trim()
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                        : ""
                    }
                  />
                  {showExplanation && (
                    <div className="space-y-2">
                      {fillInBlanks[index] && (
                        <div className="p-2 bg-gray-50 border border-gray-200 rounded">
                          <span className="text-sm font-medium text-gray-900">Your answer: </span>
                          <span className="text-sm text-gray-800">{fillInBlanks[index] || "No answer"}</span>
                        </div>
                      )}
                      <div className="p-2 bg-green-50 border border-green-200 rounded">
                        <span className="text-sm font-medium text-green-900">Correct answer: </span>
                        <span className="text-sm text-green-800">{blank}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {question.questionType === "flashcard" && (
          <div className="space-y-4">
            <div className="relative">
              <Card className="min-h-[200px] cursor-pointer" onClick={() => setIsFlashcardFlipped(!isFlashcardFlipped)}>
                <CardContent className="flex items-center justify-center h-full p-8">
                  <div className="text-center">
                    {!isFlashcardFlipped ? (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Front</h3>
                        <p className="text-lg">{question.questionText}</p>
                        <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                          <Eye className="h-4 w-4 mr-1" />
                          Click to reveal answer
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-xl font-semibold mb-4">Back</h3>
                        <p className="text-lg">{question.flashcardBack || question.correctAnswer}</p>
                        <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                          <EyeOff className="h-4 w-4 mr-1" />
                          Click to hide answer
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            {isFlashcardFlipped && !showExplanation && (
              <div className="space-y-2">
                <Label>How well did you know this?</Label>
                <RadioGroup value={selectedAnswer} onValueChange={onAnswerChange}>
                  <div className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="easy" id="easy" />
                      <Label htmlFor="easy" className="text-green-600">
                        Easy
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="medium" />
                      <Label htmlFor="medium" className="text-yellow-600">
                        Medium
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hard" id="hard" />
                      <Label htmlFor="hard" className="text-red-600">
                        Hard
                      </Label>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            )}
          </div>
        )}

        {question.questionType === "mixed" && (
          <div className="space-y-4">
            {question.options ? (
              // Mixed multiple choice
              <RadioGroup value={selectedAnswer} onValueChange={onAnswerChange} disabled={showExplanation}>
                <div className="space-y-3">
                  {question.options.map((option, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-2 p-3 rounded-lg border ${
                        showExplanation
                          ? option === question.correctAnswer
                            ? "bg-green-50 border-green-200"
                            : option === selectedAnswer && option !== question.correctAnswer
                              ? "bg-red-50 border-red-200"
                              : "bg-gray-50 border-gray-200"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <RadioGroupItem value={option} id={`mixed-option-${index}`} />
                      <Label htmlFor={`mixed-option-${index}`} className="flex-1 cursor-pointer">
                        <span className="font-mono text-sm mr-2">{String.fromCharCode(65 + index)}.</span>
                        {option}
                        {showExplanation && option === question.correctAnswer && (
                          <Badge className="ml-2 bg-green-100 text-green-800">Correct Answer</Badge>
                        )}
                        {showExplanation && option === selectedAnswer && option !== question.correctAnswer && (
                          <Badge className="ml-2 bg-red-100 text-red-800">Your Answer</Badge>
                        )}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            ) : (
              // Mixed short answer
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mixed-answer">Your Answer:</Label>
                  <Textarea
                    id="mixed-answer"
                    value={selectedAnswer}
                    onChange={(e) => onAnswerChange(e.target.value)}
                    placeholder="Type your answer here..."
                    rows={4}
                    disabled={showExplanation}
                    className={
                      showExplanation
                        ? selectedAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
                          ? "bg-green-50 border-green-200"
                          : "bg-red-50 border-red-200"
                        : ""
                    }
                  />
                </div>
                
                {/* Show user answer vs correct answer comparison in review mode */}
                {showExplanation && (
                  <div className="space-y-3">
                    {selectedAnswer && (
                      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-1">Your Answer:</h4>
                        <p className="text-gray-800">{selectedAnswer || "No answer provided"}</p>
                      </div>
                    )}
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-1">Correct Answer:</h4>
                      <p className="text-green-800">{question.correctAnswer}</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {showExplanation && question.explanation && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
            <p className="text-blue-800 text-sm">{question.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
