"use client"

import Head from 'next/head'
import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { ProtectedRoute } from '@/components/auth/protected-route'
import PDFUpload from '@/components/upload/pdf-upload'
import { FileText, Clock, CheckCircle, Trash2, BookOpen, Brain, ArrowRight } from 'lucide-react'
import { formatFileSize, getUserFiles, deleteFile, type UploadResult } from '@/lib/file-utils'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadUserFiles()
  }, [])

  const loadUserFiles = async () => {
    try {
      const files = await getUserFiles()
      setUploadedFiles(files)
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUploadSuccess = (result: UploadResult) => {
    if (result.file) {
      // Add the new file to the beginning of the list
      setUploadedFiles(prev => [result.file!, ...prev])
    }
  }

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error)
    // Error is already displayed in the PDFUpload component
  }

  const handleDeleteFile = async (fileId: string) => {
    if (confirm('Are you sure you want to delete this file?')) {
      const success = await deleteFile(fileId)
      if (success) {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
      } else {
        alert('Failed to delete file')
      }
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <Head>
          <title>Upload Documents - AI-GIR</title>
        </Head>

        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Documents</h1>
            <p className="mt-2 text-gray-600">
              Upload PDF documents to generate interactive quizzes and study materials
            </p>
          </div>

          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Upload PDF File
            </h2>
            <PDFUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
            />
          </div>

          {/* Process Flow */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              What happens after upload?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <FileText className="w-8 h-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Text Extraction</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    We extract and analyze the text content from your PDF
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Clock className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">AI Processing</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Our AI generates quizzes and study materials from your content
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Ready to Study</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Access your personalized quizzes and reviewers
                  </p>
                </div>
              </div>
            </div>
          </div>
{/* Uploaded Files */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Your Documents
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading your files...</p>
              </div>
            ) : uploadedFiles.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No documents uploaded yet</p>
                <p className="text-sm text-gray-400 mb-6">Upload your first PDF to get started</p>
                
                {/* Preview of what they can do */}
                <div className="max-w-md mx-auto">
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                      <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                      <p className="font-medium text-blue-900">Study Materials</p>
                      <p className="text-blue-700">Generate reviewers</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <Brain className="w-6 h-6 text-green-600 mx-auto mb-1" />
                      <p className="font-medium text-green-900">AI Quizzes</p>
                      <p className="text-green-700">Create practice tests</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    ↑ Available after uploading documents
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {uploadedFiles.map((file) => (
                  <div key={file.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-8 h-8 text-red-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 truncate">{file.original_name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(file.file_size)} • 
                          {new Date(file.upload_date).toLocaleDateString()} at {' '}
                          {new Date(file.upload_date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-green-600 font-medium flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Ready
                      </div>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                        title="Delete file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Study Materials & Quiz Creation */}
          {uploadedFiles.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Create Study Materials?
                </h2>
                <p className="text-gray-600">
                  Transform your uploaded documents into interactive study materials and quizzes
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Create Study Materials */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-blue-300 transition-colors">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Study Materials</h3>
                      <p className="text-sm text-gray-600">Create reviewers and summaries</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Generate comprehensive study guides, key concepts, and review materials from your uploaded documents.
                  </p>
                  <button
                    onClick={() => router.push('/reviewers/generate')}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Create Study Materials</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''} available
                  </p>
                </div>

                {/* Create Quizzes */}
                <div className="bg-white rounded-lg p-6 border border-gray-200 hover:border-green-300 transition-colors">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">AI Quizzes</h3>
                      <p className="text-sm text-gray-600">Generate interactive tests</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Create personalized quizzes and practice tests based on your document content to test your knowledge.
                  </p>
                  <button
                    onClick={() => router.push('/quizzes/generate')}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Brain className="w-4 h-4" />
                    <span>Generate Quizzes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-center text-gray-500 mt-2">
                    {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  💡 Tip: Upload more documents to create more comprehensive study materials
                </p>
              </div>
            </div>
          )}

          

          {/* Storage Info */}
          {uploadedFiles.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-start space-x-2">
                <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900">Storage Information</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    You have {uploadedFiles.length} document{uploadedFiles.length !== 1 ? 's' : ''} uploaded. 
                    Total size: {formatFileSize(uploadedFiles.reduce((sum, file) => sum + file.file_size, 0))}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
