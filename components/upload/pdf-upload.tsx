'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadPDFFile, validateFileWithStorageLimit, FILE_CONSTRAINTS, formatFileSize, type UploadResult } from '@/lib/file-utils'

interface FileUploadProps {
  onUploadSuccess?: (result: UploadResult) => void
  onUploadError?: (error: string) => void
  className?: string
}

interface UploadState {
  isUploading: boolean
  uploadProgress: number
  error: string | null
  success: boolean
  uploadedFile: UploadResult['file'] | null
}

export default function PDFUpload({ onUploadSuccess, onUploadError, className }: FileUploadProps) {
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    uploadProgress: 0,
    error: null,
    success: false,
    uploadedFile: null
  })

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    
    // Reset state
    setUploadState({
      isUploading: true,
      uploadProgress: 0,
      error: null,
      success: false,
      uploadedFile: null
    })

    // Validate file including storage limit
    const validation = await validateFileWithStorageLimit(file)
    if (!validation.isValid) {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: validation.error || 'File validation failed'
      }))
      onUploadError?.(validation.error || 'File validation failed')
      return
    }

    try {
      // Simulate upload progress
      setUploadState(prev => ({ ...prev, uploadProgress: 25 }))
      
      // Upload file
      const result = await uploadPDFFile(file)
      
      setUploadState(prev => ({ ...prev, uploadProgress: 100 }))

      if (result.success) {
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          success: true,
          uploadedFile: result.file || null
        }))
        onUploadSuccess?.(result)
      } else {
        setUploadState(prev => ({
          ...prev,
          isUploading: false,
          error: result.error || 'Upload failed'
        }))
        onUploadError?.(result.error || 'Upload failed')
      }
    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        isUploading: false,
        error: 'An unexpected error occurred'
      }))
      onUploadError?.('An unexpected error occurred')
    }
  }, [onUploadSuccess, onUploadError])

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    fileRejections
  } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: FILE_CONSTRAINTS.MAX_SIZE,
    multiple: false
  })

  const resetUpload = () => {
    setUploadState({
      isUploading: false,
      uploadProgress: 0,
      error: null,
      success: false,
      uploadedFile: null
    })
  }

  return (
    <div className={`w-full max-w-2xl mx-auto ${className}`}>
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive && !isDragReject ? 'border-blue-400 bg-blue-50' : ''}
          ${isDragReject ? 'border-red-400 bg-red-50' : ''}
          ${uploadState.success ? 'border-green-400 bg-green-50' : ''}
          ${!isDragActive && !isDragReject && !uploadState.success ? 'border-gray-300 hover:border-gray-400' : ''}
        `}
      >
        <input {...getInputProps()} />
        
        {uploadState.isUploading ? (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-blue-500 mx-auto animate-pulse" />
            <div>
              <p className="text-lg font-medium text-gray-900">Uploading...</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadState.uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">{uploadState.uploadProgress}%</p>
            </div>
          </div>
        ) : uploadState.success ? (
          <div className="space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="text-lg font-medium text-green-900">Upload Successful!</p>
              {uploadState.uploadedFile && (
                <div className="mt-4 p-4 bg-white rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <File className="w-8 h-8 text-red-500" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-gray-900">{uploadState.uploadedFile.original_name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(uploadState.uploadedFile.file_size)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={resetUpload}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Upload Another File
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive ? 'Drop your PDF file here' : 'Drag & drop a PDF file here'}
              </p>
              <p className="text-sm text-gray-500">or click to select a file</p>
                            <div className="mt-3 space-y-1">
                <p className="text-xs text-gray-400">
                  PDF files only • Max {FILE_CONSTRAINTS.MAX_SIZE / (1024 * 1024)}MB per file
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {uploadState.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-800">{uploadState.error}</p>
          </div>
          <button
            onClick={resetUpload}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* File Rejection Errors */}
      {fileRejections.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-800">File rejected:</p>
          </div>
          <ul className="mt-2 text-sm text-red-700">
            {fileRejections.map(({ file, errors }) => (
              <li key={file.name}>
                {file.name}: {errors.map(e => e.message).join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
