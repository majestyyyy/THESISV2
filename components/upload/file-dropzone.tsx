"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, type File, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { validateFile, formatFileSize, uploadPDFFile } from "@/lib/file-utils"
import type { UploadProgress } from "@/lib/file-utils"

// Define the FileUpload interface locally since it's not in file-utils
interface FileUpload {
  id: string
  file: File
  progress: number
  status: "uploading" | "processing" | "completed" | "error"
  error?: string
  extractedText?: string
}

// Helper function to get file icon based on file type
function getFileIcon(fileType: string): string {
  if (fileType === "application/pdf") return "📄"
  if (fileType.includes("word") || fileType.includes("document")) return "📝"
  if (fileType === "text/plain") return "📄"
  return "📎"
}

// Mock function for extracting text from file (you'll need to implement this based on your needs)
async function extractTextFromFile(file: File): Promise<string> {
  // This is a placeholder - you'll need to implement actual text extraction
  // For PDF files, you might use PDF.js or similar
  // For now, return a placeholder
  return `Extracted text from ${file.name}`
}

// Wrapper function to match the expected uploadFile signature
async function uploadFile(file: File, onProgress: (progress: number) => void): Promise<void> {
  const result = await uploadPDFFile(file, (progressData: UploadProgress) => {
    onProgress(progressData.percentage)
  })
  
  if (!result.success) {
    throw new Error(result.error || "Upload failed")
  }
}

interface FileDropzoneProps {
  onFilesUploaded: (files: FileUpload[]) => void
}

export function FileDropzone({ onFilesUploaded }: FileDropzoneProps) {
  const [uploads, setUploads] = useState<FileUpload[]>([])
  const [error, setError] = useState<string>("")

  const processFile = async (file: File): Promise<FileUpload> => {
    const fileUpload: FileUpload = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "uploading",
    }

    try {
      // Upload file
      await uploadFile(file, (progress) => {
        setUploads((prev) => prev.map((upload) => (upload.id === fileUpload.id ? { ...upload, progress } : upload)))
      })

      // Update status to processing
      setUploads((prev) =>
        prev.map((upload) =>
          upload.id === fileUpload.id ? { ...upload, status: "processing", progress: 100 } : upload,
        ),
      )

      // Extract text
      const extractedText = await extractTextFromFile(file)

      // Mark as completed
      const completedUpload = {
        ...fileUpload,
        status: "completed" as const,
        extractedText,
      }

      setUploads((prev) => prev.map((upload) => (upload.id === fileUpload.id ? completedUpload : upload)))

      return completedUpload
    } catch (err) {
      const errorUpload = {
        ...fileUpload,
        status: "error" as const,
        error: "Failed to process file",
      }

      setUploads((prev) => prev.map((upload) => (upload.id === fileUpload.id ? errorUpload : upload)))

      return errorUpload
    }
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setError("")

      // Validate files
      const validFiles: File[] = []
      for (const file of acceptedFiles) {
        const validation = validateFile(file)
        if (!validation.isValid) {
          setError(validation.error || "Invalid file")
          return
        }
        validFiles.push(file)
      }

      // Create initial upload objects
      const newUploads = validFiles.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        progress: 0,
        status: "uploading" as const,
      }))

      setUploads((prev) => [...prev, ...newUploads])

      // Process files
      const processedFiles = await Promise.all(validFiles.map(processFile))
      onFilesUploaded(processedFiles.filter((file) => file.status === "completed"))
    },
    [onFilesUploaded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/msword": [".doc"],
      "text/plain": [".txt"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  const removeUpload = (id: string) => {
    setUploads((prev) => prev.filter((upload) => upload.id !== id))
  }

  const clearAll = () => {
    setUploads([])
    setError("")
  }

  return (
    <div className="space-y-6">
      {/* Dropzone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-lg text-blue-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg text-gray-600 mb-2">Drag & drop files here, or click to select</p>
                <p className="text-sm text-gray-500 mb-4">Supports PDF, DOCX, DOC, and TXT files (max 10MB each)</p>
                <Button variant="outline">Choose Files</Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Uploading Files</h3>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear All
              </Button>
            </div>

            <div className="space-y-4">
              {uploads.map((upload) => (
                <div key={upload.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{getFileIcon(upload.file.type)}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{upload.file.name}</p>
                      <Button variant="ghost" size="sm" onClick={() => removeUpload(upload.id)} className="h-6 w-6 p-0">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">{formatFileSize(upload.file.size)}</p>

                    {upload.status === "uploading" && (
                      <div className="space-y-1">
                        <Progress value={upload.progress} className="h-2" />
                        <p className="text-xs text-gray-500">Uploading... {Math.round(upload.progress)}%</p>
                      </div>
                    )}

                    {upload.status === "processing" && (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className="text-xs text-blue-600">Processing and extracting text...</p>
                      </div>
                    )}

                    {upload.status === "completed" && (
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <p className="text-xs text-green-600">Upload completed successfully</p>
                      </div>
                    )}

                    {upload.status === "error" && (
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <p className="text-xs text-red-600">{upload.error || "Upload failed"}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
