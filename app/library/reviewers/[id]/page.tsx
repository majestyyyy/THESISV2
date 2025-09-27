'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ArrowLeft, FileText, Brain, BookOpen, Calendar, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react'
import { getStudyMaterialById, type StudyMaterial } from '@/lib/reviewer-utils'
import { formatMarkdownContent } from '@/lib/content-formatter'

interface StudyMaterialPageProps {
  params: Promise<{ id: string }>
}

export default function StudyMaterialPage({ params }: StudyMaterialPageProps) {
  const resolvedParams = use(params)
  const [studyMaterial, setStudyMaterial] = useState<StudyMaterial | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set())
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)

  useEffect(() => {
    const loadStudyMaterial = async () => {
      try {
        setLoading(true)
        setError(null)
        const material = await getStudyMaterialById(resolvedParams.id)
        if (material) {
          setStudyMaterial(material)
        } else {
          setError("Study material not found")
        }
      } catch (err) {
        console.error('Error loading study material:', err)
        setError("Failed to load study material")
      } finally {
        setLoading(false)
      }
    }

    loadStudyMaterial()
  }, [resolvedParams.id])

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

  // Helper function to format content (using imported formatMarkdownContent)
  
  // Toggle flashcard flip state
  const toggleCardFlip = (cardIndex: number) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cardIndex)) {
        newSet.delete(cardIndex)
      } else {
        newSet.add(cardIndex)
      }
      return newSet
    })
  }

  // Interactive content navigation functions
  const nextFlashcard = () => {
    if (studyMaterial?.type === "flashcards" && studyMaterial.content.flashcards) {
      const flashcards = studyMaterial.content.flashcards
      setCurrentFlashcardIndex(prev => 
        prev < flashcards.length - 1 ? prev + 1 : 0
      )
      setShowAnswer(false)
    } else if (studyMaterial?.type === "notes" && studyMaterial.content.notes) {
      const notes = studyMaterial.content.notes
      setCurrentFlashcardIndex(prev => 
        prev < notes.length - 1 ? prev + 1 : 0
      )
    }
  }

  const previousFlashcard = () => {
    if (studyMaterial?.type === "flashcards" && studyMaterial.content.flashcards) {
      const flashcards = studyMaterial.content.flashcards
      setCurrentFlashcardIndex(prev => 
        prev > 0 ? prev - 1 : flashcards.length - 1
      )
      setShowAnswer(false)
    } else if (studyMaterial?.type === "notes" && studyMaterial.content.notes) {
      const notes = studyMaterial.content.notes
      setCurrentFlashcardIndex(prev => 
        prev > 0 ? prev - 1 : notes.length - 1
      )
    }
  }

  const toggleAnswer = () => {
    setShowAnswer(prev => !prev)
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="flex flex-col items-center justify-center min-h-96 space-y-6 p-8">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Loading Study Material</h3>
                <p className="text-gray-600">Preparing your personalized content...</p>
              </div>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error || !studyMaterial) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
            <div className="flex flex-col items-center justify-center min-h-96 space-y-6 p-8">
              <div className="w-24 h-24 bg-gradient-to-r from-red-100 to-orange-100 rounded-2xl flex items-center justify-center">
                <FileText className="w-12 h-12 text-red-500" />
              </div>
              <div className="text-center space-y-4 max-w-md">
                <h3 className="text-2xl font-bold text-gray-900">Study Material Not Found</h3>
                <p className="text-gray-600 leading-relaxed">{error || "The requested study material could not be found or may have been deleted."}</p>
                <div className="pt-2">
                  <Link href="/library">
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 px-6 py-3">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Library
                    </Button>
                  </Link>
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
          <div className="max-w-7xl mx-auto p-6 space-y-8">
            {/* Enhanced Header */}
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 rounded-2xl p-8 text-white shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 to-indigo-600/80"></div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <Link href="/library">
                    <Button variant="ghost" className="text-white hover:bg-white/20 border border-white/30 backdrop-blur-sm">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Library
                    </Button>
                  </Link>
                  
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-blue-500 text-white text-sm font-medium shadow-lg">
                      {studyMaterial.type === "summary" ? "📄 Study Guide" :
                       studyMaterial.type === "flashcards" ? "🧠 Flashcard" : "📝 Notes"}
                    </Badge>
                    <Badge className="bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                      ✨ AI Generated
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg bg-blue-500">
                    {getTypeIcon(studyMaterial.type)}
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-white mb-2">{studyMaterial.title}</h1>
                    <p className="text-blue-100 text-lg">
                      AI-powered {studyMaterial.type} designed for effective learning
                    </p>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-blue-100">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-blue-200" />
                      <span>Created {new Date(studyMaterial.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-200" />
                      <span>Source: {studyMaterial.fileName}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-blue-200" />
                      <span>
                        {studyMaterial.type === "summary" ? "📖 Comprehensive Guide" : 
                         studyMaterial.type === "flashcards" ? `🎯 ${studyMaterial.content.flashcards?.length || 0} Cards` :
                         `📚 ${studyMaterial.content.notes?.length || 0} Study Points`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Study Material Content */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-200 shadow-xl overflow-hidden">
              <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-r from-blue-500 to-indigo-600">
                      <div className="text-white">
                        {getTypeIcon(studyMaterial.type)}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-blue-800">
                        {studyMaterial.type === "summary" ? "Study Guide" :
                         studyMaterial.type === "flashcards" ? "Flashcard" : "Study Notes"}
                      </h2>
                      <p className="text-blue-600 text-sm">Click to flip and learn</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-8">
              <div className="space-y-8">
                {/* Interactive Content Display */}
                <div className="flex flex-col items-center space-y-6">
                  <div className="w-full max-w-4xl">
                    {studyMaterial.type === "flashcards" && studyMaterial.content.flashcards && (() => {
                      const card = studyMaterial.content.flashcards[currentFlashcardIndex]
                      return (
                        <div className="group">
                          {/* Card Header */}
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl p-6 border border-blue-100 border-b-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                {!showAnswer ? (
                                  <>
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-4 shadow-md">
                                      <span className="text-white text-sm font-bold">Q</span>
                                    </div>
                                    <span className="text-sm font-bold text-blue-700 uppercase tracking-wider">Question</span>
                                  </>
                                ) : (
                                  <>
                                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-4 shadow-md">
                                      <span className="text-white text-sm font-bold">A</span>
                                    </div>
                                    <span className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Answer</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Interactive Card Content */}
                          <div className="relative h-80">
                            <div className="absolute inset-0 w-full h-full">
                              {!showAnswer ? (
                                /* Question Side */
                                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-100 border-t-0 rounded-b-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={toggleAnswer}>
                                  <div className="p-8 h-full flex flex-col justify-center">
                                    <div className="flex-1 flex items-center justify-center">
                                      <p className="text-blue-900 font-semibold text-xl leading-relaxed text-center">{card.front}</p>
                                    </div>
                                    <div className="mt-6 text-center">
                                      <div className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-full text-sm font-medium shadow-md hover:bg-blue-600 transition-colors">
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Flip
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                /* Answer Side */
                                <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-indigo-100 border border-blue-100 border-t-0 rounded-b-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer" onClick={toggleAnswer}>
                                  <div className="p-8 h-full flex flex-col justify-center">
                                    <div className="flex-1 flex items-center justify-center">
                                      <p className="text-indigo-800 font-medium text-lg leading-relaxed text-center">{card.back}</p>
                                    </div>
                                    <div className="mt-6 text-center">
                                      <div className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-full text-sm font-medium shadow-md hover:bg-indigo-700 transition-colors">
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Flip back
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {studyMaterial.type === "summary" && studyMaterial.content.summary && (
                      <div className="bg-gradient-to-br from-blue-50 via-blue-50/50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="prose prose-lg max-w-none prose-blue">
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-blue-100 shadow-sm">
                            {formatMarkdownContent(studyMaterial.content.summary)}
                          </div>
                        </div>
                      </div>
                    )}

                    {studyMaterial.type === "notes" && studyMaterial.content.notes && studyMaterial.content.notes[currentFlashcardIndex] && (
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-blue-100 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-blue-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md">
                              {currentFlashcardIndex + 1}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Study Point</div>
                              <div className="text-xs text-blue-600 mt-1">Learning concept #{currentFlashcardIndex + 1}</div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="prose prose-blue max-w-none">
                            <div className="text-gray-800 text-base leading-relaxed">
                              {formatMarkdownContent(studyMaterial.content.notes[currentFlashcardIndex])}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation Controls - Show for flashcards and notes */}
                  {(studyMaterial.type === "flashcards" || studyMaterial.type === "notes") && (
                    <div className="flex items-center justify-center space-x-6">
                      <button
                        onClick={previousFlashcard}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          (studyMaterial.type === "flashcards" && (!studyMaterial.content.flashcards || studyMaterial.content.flashcards.length <= 1)) ||
                          (studyMaterial.type === "notes" && (!studyMaterial.content.notes || studyMaterial.content.notes.length <= 1))
                        }
                      >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Previous</span>
                      </button>
                      
                      <div className="text-center px-4">
                        <div className="text-lg font-bold text-blue-700">
                          {currentFlashcardIndex + 1} / {
                            studyMaterial.type === "flashcards" ? (studyMaterial.content.flashcards?.length || 0) :
                            studyMaterial.type === "notes" ? (studyMaterial.content.notes?.length || 0) : 0
                          }
                        </div>
                        <div className="text-sm text-blue-500 capitalize">{studyMaterial.type}</div>
                      </div>
                      
                      <button
                        onClick={nextFlashcard}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          (studyMaterial.type === "flashcards" && (!studyMaterial.content.flashcards || studyMaterial.content.flashcards.length <= 1)) ||
                          (studyMaterial.type === "notes" && (!studyMaterial.content.notes || studyMaterial.content.notes.length <= 1))
                        }
                      >
                        <span>Next</span>
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
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
