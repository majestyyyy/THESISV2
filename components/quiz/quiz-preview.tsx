"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Save } from "lucide-react"

interface QuizPreviewProps {
  quiz: {
    title: string
    description: string
    difficulty: string
    totalQuestions: number
    fileName: string
  }
  onSave: (quiz: any) => void
  onCancel: () => void
}

export function QuizPreview({ quiz, onSave, onCancel }: QuizPreviewProps) {
  const [editingQuiz, setEditingQuiz] = useState(quiz)

  const handleSave = () => {
    onSave(editingQuiz)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Input
            value={editingQuiz.title}
            onChange={(e) => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
            className="text-xl font-bold border-none p-0 h-auto"
          />
        </CardHeader>
        <CardContent>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Quiz
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}