'use client'

import { use, useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ArrowLeft, FileText, Brain, BookOpen, Calendar } from 'lucide-react'
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

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-gray-600">Loading study material...</p>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (error || !studyMaterial) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
            <FileText className="h-16 w-16 text-gray-400" />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Study Material Not Found</h3>
              <p className="text-gray-600 mb-4">{error || "The requested study material could not be found."}</p>
              <Link href="/library">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Library
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
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/library">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Library
                </Button>
              </Link>
              <div>
                <div className="flex items-center space-x-3">
                  {getTypeIcon(studyMaterial.type)}
                  <h1 className="text-3xl font-bold text-gray-900">{studyMaterial.title}</h1>
                  <Badge variant="outline">
                    {studyMaterial.type === "summary" ? "Study Guide" :
                     studyMaterial.type === "flashcards" ? "Flashcards" : "Notes"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(studyMaterial.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>From: {studyMaterial.fileName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Study Material Content */}
          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl text-gray-900">Study Material</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    AI-generated {studyMaterial.type} with enhanced formatting
                  </p>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {studyMaterial.type === "summary" ? "Summary" :
                   studyMaterial.type === "flashcards" ? "Flashcards" : "Notes"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {studyMaterial.type === "summary" && studyMaterial.content.summary && (
                <div className="prose prose-lg max-w-none">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100 shadow-sm">
                    <div className="space-y-4">
                      {formatMarkdownContent(studyMaterial.content.summary)}
                    </div>
                  </div>
                </div>
              )}

              {studyMaterial.type === "flashcards" && studyMaterial.content.flashcards && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Flashcard Set ({studyMaterial.content.flashcards.length} cards)
                    </h3>
                  </div>
                  <div className="grid gap-6">
                    {studyMaterial.content.flashcards.map((card, index) => (
                      <Card key={index} className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
                        <CardContent className="p-6">
                          <div className="space-y-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="bg-purple-100 text-purple-700 rounded-full w-10 h-10 flex items-center justify-center text-sm font-bold">
                                  {index + 1}
                                </div>
                                <span className="text-sm font-medium text-gray-600">Flashcard</span>
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
                                  <Badge variant="outline" className="text-xs border-gray-300">
                                    {card.category}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="grid gap-4">
                              <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
                                <div className="flex items-center mb-2">
                                  <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Question</span>
                                </div>
                                <p className="font-medium text-purple-900 text-base leading-relaxed">{card.front}</p>
                              </div>
                              <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                                <div className="flex items-center mb-2">
                                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Answer</span>
                                </div>
                                <p className="text-gray-800 text-base leading-relaxed">{card.back}</p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {studyMaterial.type === "notes" && studyMaterial.content.notes && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Study Notes ({studyMaterial.content.notes.length} notes)
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {studyMaterial.content.notes.map((note, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-6 rounded-xl border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-gray-800 text-base leading-relaxed">
                            {formatMarkdownContent(note)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
