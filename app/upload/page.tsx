"use client"

import Head from 'next/head'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import PDFUpload from '@/components/upload/pdf-upload'
import { FileText, Clock, CheckCircle, Trash2, BookOpen, Brain, ArrowRight, CloudUpload, Sparkles, BarChart3, TrendingUp, Zap } from 'lucide-react'
import Image from "next/image"
import { formatFileSize, getUserFiles, deleteFile, type UploadResult } from '@/lib/file-utils'
import { useRouter } from 'next/navigation'
import useSWR from "swr"
import { Button } from "@/components/ui/button"

export default function UploadPage() {
  const router = useRouter()
  const [isHydrated, setIsHydrated] = useState(false)

  // SWR for uploaded files
  const { data: uploadedFiles, mutate, error } = useSWR(isHydrated ? "userFiles" : null, getUserFiles, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    onError: (err) => {
      console.error("Upload files fetch error:", err)
    },
  })

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  const handleUploadSuccess = (result: UploadResult) => {
    if (result.file) {
      // Add the new file to the beginning of the list
      mutate([result.file, ...(uploadedFiles || [])], false)
    }
  }

  const handleDeleteFile = async (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      const success = await deleteFile(fileId)
      if (success && uploadedFiles) {
        mutate(uploadedFiles.filter((file: any) => file.id !== fileId), false)
      } else {
        alert('Failed to delete file')
      }
    }
  }

  if (error) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="flex flex-col items-center justify-center min-h-96 space-y-6 p-8">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                <FileText className="w-10 h-10 text-red-600" />
              </div>
              <div className="text-center space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">Upload Error</h3>
                <p className="text-red-600 max-w-md">{error.message || "Failed to load uploaded files."}</p>
              </div>
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Try Again
              </Button>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  if (!isHydrated || !uploadedFiles) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            <div className="flex flex-col items-center justify-center min-h-96 space-y-6 p-8">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <CloudUpload className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Loading Upload Center</h3>
                <p className="text-gray-600">Preparing your workspace...</p>
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
        <Head>
          <title>Upload Documents - AI-GIR</title>
        </Head>

        <div className="space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
          {/* Enhanced Header Section */}
          <div className="mb-8 lg:mb-12">
            <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 lg:p-12 text-white shadow-2xl">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full"></div>
                <div className="absolute top-20 left-32 w-1 h-1 bg-white rounded-full"></div>
                <div className="absolute top-32 left-20 w-1.5 h-1.5 bg-white rounded-full"></div>
                <div className="absolute top-16 right-24 w-2 h-2 bg-white rounded-full"></div>
                <div className="absolute top-40 right-16 w-1 h-1 bg-white rounded-full"></div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute top-4 right-4 opacity-20">
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>
              <div className="absolute bottom-4 left-4 opacity-20">
                <CloudUpload className="h-6 w-6 animate-bounce" />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center mb-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mr-4">
                      <CloudUpload className="h-8 w-8 text-blue-200" />
                    </div>
                    <div>
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">
                        AI Upload Center
                      </h1>
                      <p className="text-lg sm:text-xl text-blue-100">
                        {uploadedFiles && uploadedFiles.length === 0 
                          ? "Upload your first document to begin AI-powered learning!"
                          : `${uploadedFiles?.length || 0} documents ready for AI processing!`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="hidden lg:flex items-center gap-6 text-center">
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold">{uploadedFiles?.length || 0}</div>
                      <div className="text-xs text-blue-200">Documents</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                      <div className="text-2xl font-bold">
                        {uploadedFiles ? (uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / 1024 / 1024).toFixed(1) : '0.0'}MB
                      </div>
                      <div className="text-xs text-blue-200">Used</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm min-w-[80px]">
                      <div className="text-xs text-blue-200 mb-1">Storage</div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${uploadedFiles ? Math.min((uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / (5 * 1024 * 1024)) * 100, 100) : 0}%` 
                          }}
                        />
                      </div>
                      <div className="text-xs text-blue-200 mt-1">
                        {uploadedFiles ? Math.round((uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / (5 * 1024 * 1024)) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Upload Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <CloudUpload className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Upload Document</h2>
                    <p className="text-sm text-gray-600">PDF files supported</p>
                  </div>
                </div>
                
                {/* Storage Usage Display */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                  <div className="text-xs text-gray-600 mb-1">Storage Usage</div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          uploadedFiles && (uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / (5 * 1024 * 1024)) > 0.8
                            ? 'bg-gradient-to-r from-orange-400 to-red-500'
                            : 'bg-gradient-to-r from-green-400 to-blue-500'
                        }`}
                        style={{ 
                          width: `${uploadedFiles ? Math.min((uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / (5 * 1024 * 1024)) * 100, 100) : 0}%` 
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {uploadedFiles ? (uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / 1024 / 1024).toFixed(1) : '0.0'}/5.0 MB
                    </span>
                  </div>
                </div>
              </div>
              
              <PDFUpload
                onUploadSuccess={handleUploadSuccess}
              />
              
              {/* Storage Warning */}
              {uploadedFiles && (uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / (5 * 1024 * 1024)) > 0.8 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-4 h-4 text-orange-600" />
                    <p className="text-sm text-orange-800">
                      <strong>Storage Almost Full:</strong> You're using {Math.round((uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / (5 * 1024 * 1024)) * 100)}% of your 5MB limit.
                      {(uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / (5 * 1024 * 1024)) >= 1 
                        ? ' Delete some files to upload new ones.'
                        : ' Consider deleting unused files to free up space.'}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Process Flow */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl border border-indigo-200 p-8 shadow-lg">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Zap className="w-6 h-6 text-indigo-600" />
                  <h2 className="text-xl font-semibold text-gray-900">AI-Powered Processing</h2>
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Our advanced AI transforms your documents into interactive learning materials in just three steps
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="relative">
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">1</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Smart Extraction</h3>
                    <p className="text-sm text-gray-600">
                      Advanced OCR and text analysis extracts and structures content from your PDF documents
                    </p>
                  </div>
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-indigo-300"></div>
                </div>
                
                <div className="relative">
                  <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-bold text-sm">2</span>
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">AI Generation</h3>
                    <p className="text-sm text-gray-600">
                      Machine learning algorithms create personalized quizzes and comprehensive study guides
                    </p>
                  </div>
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-indigo-300 to-green-300"></div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-200 border border-gray-100">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-sm">3</span>
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ready to Learn</h3>
                  <p className="text-sm text-gray-600">
                    Access interactive quizzes, study materials, and progress tracking tailored to your content
                  </p>
                </div>
              </div>
            </div>
            {/* Enhanced Document Library */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Document Library</h2>
                    <p className="text-sm text-gray-600">Manage your uploaded files</p>
                  </div>
                </div>
                {uploadedFiles.length > 0 && (
                  <div className="bg-blue-50 rounded-lg px-3 py-1 border border-blue-200">
                    <span className="text-blue-700 font-medium text-sm">{uploadedFiles.length} files</span>
                  </div>
                )}
              </div>
              
              {uploadedFiles.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    Upload your first PDF document to unlock AI-powered study materials and interactive learning experiences
                  </p>
                  
                  {/* Enhanced Preview Cards */}
                  <div className="max-w-lg mx-auto">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 hover:border-blue-300 transition-colors">
                        <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-blue-900 mb-2">Study Materials</h4>
                        <p className="text-blue-700 text-sm">Comprehensive reviewers and summaries</p>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 hover:border-green-300 transition-colors">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                          <Brain className="w-6 h-6 text-white" />
                        </div>
                        <h4 className="font-semibold text-green-900 mb-2">AI Quizzes</h4>
                        <p className="text-green-700 text-sm">Interactive practice tests and assessments</p>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-center space-x-2 text-gray-400">
                      <ArrowRight className="w-4 h-4 rotate-90" />
                      <span className="text-sm">Available after uploading documents</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {uploadedFiles.map((file, index) => (
                    <div 
                      key={file.id} 
                      className="group bg-gradient-to-r from-gray-50 to-gray-100 hover:from-blue-50 hover:to-indigo-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-200 p-6 shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 flex-1 min-w-0">
                          <div className="relative">
                            <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                              <FileText className="w-7 h-7 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                              <CheckCircle className="w-3 h-3 text-white" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-1">
                              <h3 className="font-semibold text-gray-900 truncate group-hover:text-blue-900 transition-colors">
                                {file.original_name}
                              </h3>
                              <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                                Ready
                              </div>
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <BarChart3 className="w-4 h-4" />
                                <span>{formatFileSize(file.file_size)}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>
                                  {new Date(file.upload_date).toLocaleDateString()} at{' '}
                                  {new Date(file.upload_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                          title="Delete file"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {/* Enhanced Study Materials & Quiz Creation */}
            {uploadedFiles.length > 0 && (
              <div className="bg-gradient-to-br from-violet-50 via-blue-50 to-indigo-50 rounded-2xl border border-violet-200 p-8 shadow-lg">
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                      Create Study Materials
                    </h2>
                  </div>
                  <p className="text-gray-600 max-w-2xl mx-auto">
                    Transform your uploaded documents into personalized learning experiences with AI-powered study tools
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Enhanced Study Materials Card */}
                  <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <BookOpen className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-900 transition-colors">Study Materials</h3>
                        <p className="text-sm text-gray-600">Comprehensive learning resources</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Key concepts and summaries</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Structured study guides</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>Important definitions</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => router.push('/reviewers/generate')}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl group-hover:scale-105"
                    >
                      <BookOpen className="w-5 h-5" />
                      <span className="font-semibold">Create Study Materials</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center justify-center space-x-2 mt-4 text-xs text-gray-500">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span>{uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''} ready for processing</span>
                    </div>
                  </div>

                  {/* Enhanced Quiz Creation Card */}
                  <div className="group bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 hover:border-green-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                        <Brain className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-900 transition-colors">AI Quizzes</h3>
                        <p className="text-sm text-gray-600">Interactive practice tests</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Multiple choice questions</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>True/false assessments</span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Performance tracking</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => router.push('/quizzes/generate')}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white px-6 py-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 shadow-lg hover:shadow-xl group-hover:scale-105"
                    >
                      <Brain className="w-5 h-5" />
                      <span className="font-semibold">Generate Quizzes</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center justify-center space-x-2 mt-4 text-xs text-gray-500">
                      <BarChart3 className="w-4 h-4 text-green-500" />
                      <span>{uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''} ready for quizzes</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Storage Info */}
            {uploadedFiles && uploadedFiles.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200 shadow-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Storage Overview</h3>
                      <p className="text-sm text-blue-700">
                        {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''} • {' '}
                        {formatFileSize(uploadedFiles.reduce((sum, file) => sum + file.file_size, 0))} used
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-600 font-medium">
                      {(uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / 1024 / 1024).toFixed(1)} / 5.0 MB
                    </div>
                    <div className="text-xs text-blue-500">
                      {Math.round((uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / (5 * 1024 * 1024)) * 100)}% of limit
                    </div>
                  </div>
                </div>
                
                {/* Storage Usage Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-blue-600 mb-1">
                    <span>Storage Usage</span>
                    <span>{Math.round((uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / (5 * 1024 * 1024)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-300 ${
                        (uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / (5 * 1024 * 1024)) > 0.8
                          ? 'bg-gradient-to-r from-orange-400 to-red-500'
                          : (uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / (5 * 1024 * 1024)) > 0.6
                          ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                          : 'bg-gradient-to-r from-green-400 to-blue-500'
                      }`}
                      style={{ 
                        width: `${Math.min((uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / (5 * 1024 * 1024)) * 100, 100)}%` 
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-blue-500 mt-1">
                    <span>0 MB</span>
                    <span>5 MB</span>
                  </div>
                </div>
                
                {/* Storage Full Warning */}
                {(uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / (5 * 1024 * 1024)) >= 1 ? (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                      <p className="text-sm text-red-800 font-medium">
                        Storage limit reached! Delete files before uploading new ones.
                      </p>
                    </div>
                  </div>
                ) : (uploadedFiles.reduce((sum, file) => sum + file.file_size, 0) / (5 * 1024 * 1024)) > 0.8 ? (
                  <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <p className="text-sm text-orange-800">
                        Storage almost full. Consider deleting unused files.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
