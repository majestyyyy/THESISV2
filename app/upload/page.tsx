"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Brain, Zap, BookOpen, ArrowRight } from "lucide-react"
import { FileDropzone } from "@/components/upload/file-dropzone"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import type { FileUpload } from "@/lib/file-utils"
import Link from "next/link"

const features = [
  {
    icon: FileText,
    title: "Multiple Formats",
    description: "Upload PDF, DOCX, DOC, and TXT files",
  },
  {
    icon: Brain,
    title: "AI Processing",
    description: "Advanced text extraction and analysis",
  },
  {
    icon: Zap,
    title: "Fast Processing",
    description: "Quick file processing and content extraction",
  },
  {
    icon: BookOpen,
    title: "Smart Organization",
    description: "Automatic categorization and tagging",
  },
]

export default function UploadPage() {
  const [uploadedFiles, setUploadedFiles] = useState<FileUpload[]>([])

  const handleFilesUploaded = (files: FileUpload[]) => {
    setUploadedFiles((prev) => [...prev, ...files])
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Upload Study Materials</h1>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              Upload your academic files and let AI transform them into personalized quizzes and comprehensive study
              materials.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center">
                <CardContent className="pt-6">
                  <feature.icon className="h-8 w-8 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* File Upload */}
          <FileDropzone onFilesUploaded={handleFilesUploaded} />

          {/* Uploaded Files Summary */}
          {uploadedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Successfully Uploaded Files</CardTitle>
                <CardDescription>Your files have been processed and are ready for AI analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <FileText className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{file.file.name}</p>
                          <p className="text-sm text-gray-500">Text extracted • Ready for AI processing</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        Processed
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                  <Link href="/quizzes/generate" className="flex-1">
                    <Button className="w-full">
                      Generate Quizzes <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/reviewers/generate" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Create Study Guides <BookOpen className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Upload Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-800">
              <ul className="space-y-2 text-sm">
                <li>• Upload clear, well-formatted documents for best AI processing results</li>
                <li>• Supported formats: PDF, DOCX, DOC, and TXT files (max 10MB each)</li>
                <li>• Multiple files can be uploaded simultaneously</li>
                <li>• Text will be automatically extracted and processed for quiz generation</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
