"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { FileText, Settings, Zap } from "lucide-react"
import type { QuizGenerationOptions } from "@/lib/quiz-utils"

interface QuizGenerationFormProps {
  files: Array<{ id: string; name: string }>
  onGenerate: (options: QuizGenerationOptions) => void
  isGenerating: boolean
}

export function QuizGenerationForm({ files, onGenerate, isGenerating }: QuizGenerationFormProps) {
  const [selectedFile, setSelectedFile] = useState<string>("")
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium")
  const [numberOfQuestions, setNumberOfQuestions] = useState([10])
  const [questionTypes, setQuestionTypes] = useState<("multiple_choice" | "true_false" | "identification")[]>([
    "multiple_choice",
  ])
  const [focusAreas, setFocusAreas] = useState("")

  const handleQuestionTypeChange = (type: "multiple_choice" | "true_false" | "identification", checked: boolean) => {
    if (checked) {
      setQuestionTypes((prev) => [...prev, type])
    } else {
      setQuestionTypes((prev) => prev.filter((t) => t !== type))
    }
  }

  const handleGenerate = () => {
    if (!selectedFile || questionTypes.length === 0) return

    const selectedFileData = files.find((f) => f.id === selectedFile)
    if (!selectedFileData) return

    const options: QuizGenerationOptions = {
      fileId: selectedFile,
      fileName: selectedFileData.name,
      difficulty,
      questionTypes,
      numberOfQuestions: numberOfQuestions[0],
      focusAreas: focusAreas ? focusAreas.split(",").map((area) => area.trim()) : undefined,
    }

    onGenerate(options)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-base sm:text-lg md:text-xl">
          <Settings className="mr-2 h-5 w-5" />
          Quiz Configuration
        </CardTitle>
        <CardDescription>Customize your AI-generated quiz settings</CardDescription>
      </CardHeader>
  <CardContent className="space-y-4 sm:space-y-6">
        {/* File Selection */}
  <div className="space-y-2 sm:space-y-3">
          <Label htmlFor="file-select">Select Source File</Label>
          <Select value={selectedFile} onValueChange={setSelectedFile}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a file to generate quiz from" />
            </SelectTrigger>
            <SelectContent>
              {files.map((file) => (
                <SelectItem key={file.id} value={file.id}>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    {file.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Level */}
  <div className="space-y-2 sm:space-y-3">
          <Label>Difficulty Level</Label>
          <Select value={difficulty} onValueChange={(value: "easy" | "medium" | "hard") => setDifficulty(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">
                <div className="flex items-center gap-2">
                  <Badge className="mr-2 bg-green-100 text-green-800">Easy</Badge>
                  Basic concepts and definitions
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                  Application and analysis
                </div>
              </SelectItem>
              <SelectItem value="hard">
                <div className="flex items-center gap-2">
                  <Badge className="mr-2 bg-red-100 text-red-800">Hard</Badge>
                  Critical thinking and synthesis
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Number of Questions */}
  <div className="space-y-3 sm:space-y-4">
          <Label>Number of Questions: {numberOfQuestions[0]}</Label>
          <Slider
            value={numberOfQuestions}
            onValueChange={setNumberOfQuestions}
            max={30}
            min={5}
            step={5}
            className="w-full"
          />
          <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-gray-500 gap-2">
            <span>5 questions</span>
            <span>30 questions</span>
          </div>
        </div>

        {/* Question Types */}
  <div className="space-y-2 sm:space-y-3">
          <Label>Question Types</Label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="multiple_choice"
                checked={questionTypes.includes("multiple_choice")}
                onCheckedChange={(checked) => handleQuestionTypeChange("multiple_choice", checked as boolean)}
              />
              <Label htmlFor="multiple_choice">Multiple Choice</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="true_false"
                checked={questionTypes.includes("true_false")}
                onCheckedChange={(checked) => handleQuestionTypeChange("true_false", checked as boolean)}
              />
              <Label htmlFor="true_false">True/False</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="identification"
                checked={questionTypes.includes("identification")}
                onCheckedChange={(checked) => handleQuestionTypeChange("identification", checked as boolean)}
              />
              <Label htmlFor="identification">Identification</Label>
            </div>
          </div>
        </div>

        {/* Focus Areas */}
        <div className="space-y-2">
          <Label htmlFor="focus-areas">Focus Areas (Optional)</Label>
          <Textarea
            id="focus-areas"
            placeholder="Enter specific topics or areas to focus on, separated by commas (e.g., cell structure, photosynthesis, mitosis)"
            value={focusAreas}
            onChange={(e) => setFocusAreas(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-gray-500">Leave blank to generate questions from the entire document content</p>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={!selectedFile || questionTypes.length === 0 || isGenerating}
          className="w-full"
          size="lg"
        >
          {isGenerating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Quiz...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Generate Quiz with AI
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
