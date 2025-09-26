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
  Calendar,
  Sparkles,
  Target,
  TrendingUp,
  Zap,
  Star,
  Copy,
  ArrowUpRight
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
        <div className="space-y-6">
          {/* Enhanced Summary Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Study Summary</h3>
                <p className="text-blue-100 text-sm">AI-generated key insights and concepts</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-blue-100">
              <div className="flex items-center space-x-1">
                <Target className="w-4 h-4" />
                <span>Key Concepts</span>
              </div>
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>Structured Learning</span>
              </div>
            </div>
          </div>

          {/* Enhanced Content Display */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
            <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-900">
              {formatSummaryContent(studyMaterial.content.summary)}
            </div>
          </div>
        </div>
      )
    }

    if (studyMaterial.type === "flashcards" && studyMaterial.content.flashcards) {
      return (
        <div className="space-y-6">
          {/* Enhanced Flashcards Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Interactive Flashcards</h3>
                <p className="text-green-100 text-sm">Test your knowledge with AI-generated questions</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm text-green-100">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Zap className="w-4 h-4" />
                  <span>{studyMaterial.content.flashcards.length} Cards</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>Active Recall</span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Flashcard Grid */}
          <div className="grid gap-4">
            {studyMaterial.content.flashcards.map((card, index) => (
              <Card key={index} className="group bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 border border-green-200 hover:border-green-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Card Number and Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {index + 1}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">QUESTION</span>
                      </div>
                      <div className="flex gap-2">
                        {card.difficulty && (
                          <Badge 
                            variant="secondary" 
                            className={`text-xs font-medium ${
                              card.difficulty === 'basic' ? 'bg-green-100 text-green-700 border-green-200' :
                              card.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                              'bg-red-100 text-red-700 border-red-200'
                            }`}
                          >
                            {card.difficulty}
                          </Badge>
                        )}
                        {card.category && (
                          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                            {card.category}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Question */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                      <p className="font-semibold text-green-800 text-sm leading-relaxed">
                        {card.front}
                      </p>
                    </div>

                    {/* Answer */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
                          <ArrowUpRight className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">ANSWER</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {card.back}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )
    }

    if (studyMaterial.type === "notes" && studyMaterial.content.notes) {
      return (
        <div className="space-y-6">
          {/* Enhanced Notes Header */}
          <div className="bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl p-6 text-white shadow-xl">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Study Notes</h3>
                <p className="text-purple-100 text-sm">Organized key points and learning materials</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-purple-100">
              <div className="flex items-center space-x-1">
                <BookOpen className="w-4 h-4" />
                <span>{studyMaterial.content.notes.length} Notes</span>
              </div>
              <div className="flex items-center space-x-1">
                <Sparkles className="w-4 h-4" />
                <span>AI Organized</span>
              </div>
            </div>
          </div>

          {/* Enhanced Notes List */}
          <div className="space-y-4">
            {studyMaterial.content.notes.map((note, index) => {
              const hasEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(note)
              
              return (
                <div
                  key={index}
                  className={`group relative bg-white hover:bg-gradient-to-br transition-all duration-200 rounded-2xl border shadow-sm hover:shadow-lg overflow-hidden ${
                    hasEmoji 
                      ? 'hover:from-blue-50 hover:to-indigo-50 border-blue-200 hover:border-blue-300' 
                      : 'hover:from-purple-50 hover:to-violet-50 border-purple-200 hover:border-purple-300'
                  }`}
                >
                  {/* Note Number Badge */}
                  <div className="absolute top-4 right-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md ${
                      hasEmoji ? 'bg-gradient-to-r from-blue-500 to-indigo-600' : 'bg-gradient-to-r from-purple-500 to-violet-600'
                    }`}>
                      {index + 1}
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Left Border Indicator */}
                      <div className={`w-1 h-full rounded-full ${
                        hasEmoji ? 'bg-gradient-to-b from-blue-400 to-indigo-500' : 'bg-gradient-to-b from-purple-400 to-violet-500'
                      }`} style={{ minHeight: '60px' }}></div>
                      
                      <div className="flex-1 pt-1">
                        {/* Note Content */}
                        <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-strong:text-gray-900">
                          <div className="text-gray-800 leading-relaxed">
                            {formatMarkdownContent(note)}
                          </div>
                        </div>

                        {/* Copy Button */}
                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:text-gray-700 h-8 px-3"
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(note)
                                // You might want to add a toast notification here
                              } catch (err) {
                                console.error('Failed to copy note', err)
                              }
                            }}
                          >
                            <Copy className="w-4 h-4 mr-1" />
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
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
      <SheetContent className="w-full max-w-xs sm:max-w-2xl md:max-w-3xl lg:max-w-5xl h-full overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Enhanced Header */}
        <SheetHeader className="space-y-4 pb-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className={`p-3 rounded-2xl shadow-lg ${
              studyMaterial.type === 'summary' ? 'bg-gradient-to-r from-blue-500 to-indigo-600' :
              studyMaterial.type === 'flashcards' ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
              'bg-gradient-to-r from-purple-500 to-violet-600'
            }`}>
              <div className="text-white">
                {getTypeIcon(studyMaterial.type)}
              </div>
            </div>
            <div className="flex-1">
              <SheetTitle className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                {studyMaterial.title}
              </SheetTitle>
              <SheetDescription className="text-sm text-gray-600 mb-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-blue-500" />
                  <span>AI-generated study material from <span className="font-medium">{studyMaterial.fileName}</span></span>
                </div>
              </SheetDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Badge className={`text-xs font-medium shadow-sm ${
                studyMaterial.type === 'summary' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                studyMaterial.type === 'flashcards' ? 'bg-green-100 text-green-700 border-green-200' :
                'bg-purple-100 text-purple-700 border-purple-200'
              }`}>
                {studyMaterial.type === 'summary' ? '📄 Summary' :
                 studyMaterial.type === 'flashcards' ? '🧠 Flashcards' :
                 '📝 Notes'}
              </Badge>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">
                ✨ AI Generated
              </Badge>
            </div>
          </div>
          
          {/* Enhanced Metadata */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/50">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span>Created {formatDate(studyMaterial.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-green-500" />
                <span>
                  {studyMaterial.type === "summary" ? "📖 15-20 min read" : 
                   studyMaterial.type === "flashcards" ? `🎯 ${studyMaterial.content.flashcards?.length || 0} cards` :
                   `📚 ${studyMaterial.content.notes?.length || 0} notes`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <span>Full View</span>
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExport}
              className="bg-white/70 backdrop-blur-sm border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 shadow-sm"
            >
              <Download className="mr-2 h-4 w-4 text-blue-600" />
              <span className="text-blue-700 font-medium">Export</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleShare}
              className="bg-white/70 backdrop-blur-sm border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200 shadow-sm"
            >
              <Share2 className="mr-2 h-4 w-4 text-green-600" />
              <span className="text-green-700 font-medium">Share</span>
            </Button>
          </div>
        </SheetHeader>

        {/* Enhanced Content Area */}
        <div className="h-[calc(100vh-280px)] pr-2 sm:pr-6 overflow-y-auto">
          <div className="py-6">
            {renderContent()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
