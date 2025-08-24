'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { 
  Download, 
  Share2, 
  Eye, 
  X, 
  FileText, 
  Brain, 
  BookOpen,
  Clock,
  Calendar
} from "lucide-react"
import type { StudyMaterial } from "@/lib/reviewer-utils"
import { formatMarkdownContent } from '@/lib/content-formatter'

interface StudyMaterialFullViewProps {
  studyMaterial: StudyMaterial
  children: React.ReactNode
}

export function StudyMaterialFullView({ studyMaterial, children }: StudyMaterialFullViewProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleExport = () => {
    const content = getContentAsText()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${studyMaterial.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = async () => {
    const text = `Check out this study material: ${studyMaterial.title}\n\nGenerated from: ${studyMaterial.fileName}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: studyMaterial.title,
          text: text,
          url: window.location.href
        })
      } catch (err) {
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(text)
        alert('Study material info copied to clipboard!')
      } catch (err) {
        console.error('Failed to copy to clipboard', err)
      }
    }
  }

  const getContentAsText = () => {
    let content = `${studyMaterial.title}\n`
    content += `Generated from: ${studyMaterial.fileName}\n`
    content += `Created: ${formatDate(studyMaterial.createdAt)}\n\n`

    if (studyMaterial.type === "summary" && studyMaterial.content.summary) {
      content += studyMaterial.content.summary
    } else if (studyMaterial.type === "flashcards" && studyMaterial.content.flashcards) {
      content += "FLASHCARDS:\n\n"
      studyMaterial.content.flashcards.forEach((card, index) => {
        content += `${index + 1}. Q: ${card.front}\n   A: ${card.back}\n\n`
      })
    } else if (studyMaterial.type === "notes" && studyMaterial.content.notes) {
      content += "STUDY NOTES:\n\n"
      studyMaterial.content.notes.forEach((note, index) => {
        content += `${index + 1}. ${note}\n\n`
      })
    }

    return content
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatSummaryContent = (content: string) => {
    return formatMarkdownContent(content)
  }

  const renderContent = () => {
    if (studyMaterial.type === "summary" && studyMaterial.content.summary) {
      return (
        <div className="prose prose-sm max-w-none">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-8 border border-blue-100">
            <div className="space-y-1">
              {formatSummaryContent(studyMaterial.content.summary)}
            </div>
          </div>
        </div>
      )
    }

    if (studyMaterial.type === "flashcards" && studyMaterial.content.flashcards) {
      return (
        <div className="space-y-4">
          {studyMaterial.content.flashcards.map((card, index) => (
            <Card key={index} className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-purple-700">Q: {card.front}</p>
                    <div className="flex gap-2">
                      {card.difficulty && (
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            card.difficulty === 'basic' ? 'bg-green-100 text-green-700' :
                            card.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}
                        >
                          {card.difficulty}
                        </Badge>
                      )}
                      {card.category && (
                        <Badge variant="outline" className="text-xs">
                          {card.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700">A: {card.back}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )
    }

    if (studyMaterial.type === "notes" && studyMaterial.content.notes) {
      return (
        <div className="space-y-3">
          {studyMaterial.content.notes.map((note, index) => {
            const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(note)
            
            return (
              <div
                key={index}
                className={`flex items-start space-x-3 p-4 rounded-lg border-l-4 transition-all hover:shadow-md ${
                  hasEmoji 
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-blue-500' 
                    : 'bg-green-50 border-l-green-500'
                }`}
              >
                <div className={`flex-shrink-0 w-7 h-7 text-white rounded-full flex items-center justify-center text-xs font-bold ${
                  hasEmoji ? 'bg-blue-500' : 'bg-green-500'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="text-gray-800 text-sm leading-relaxed">
                    {formatMarkdownContent(note)}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )
    }

    return <p className="text-gray-500">No content available</p>
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-4xl h-full overflow-hidden">
        <SheetHeader className="space-y-4 pb-6">
          <div className="flex items-center space-x-3">
            {getTypeIcon(studyMaterial.type)}
            <div className="flex-1">
              <SheetTitle className="text-xl font-bold text-gray-900">
                {studyMaterial.title}
              </SheetTitle>
              <SheetDescription className="text-gray-600">
                AI-generated study material from {studyMaterial.fileName}
              </SheetDescription>
            </div>
            <Badge className="bg-green-100 text-green-800">Generated</Badge>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>Created {formatDate(studyMaterial.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4" />
              <span>
                {studyMaterial.type === "summary" ? "15-20 min read" : 
                 studyMaterial.type === "flashcards" ? `${studyMaterial.content.flashcards?.length || 0} cards` :
                 `${studyMaterial.content.notes?.length || 0} notes`}
              </span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
          
          <Separator />
        </SheetHeader>

        <div className="h-[calc(100vh-200px)] pr-6 overflow-y-auto">
          <div className="space-y-6">
            {renderContent()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
