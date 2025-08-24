'use client'

import { useState, useEffect } from 'react'
import { Trash2, Download, Search, SortAsc, SortDesc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getUserFiles, deleteFile, getFileDownloadURL, formatFileSize, type FileRecord } from '@/lib/file-utils'

interface FileListProps {
  refreshTrigger?: number
  onFileDeleted?: () => void
}

type SortField = 'upload_date' | 'original_name' | 'file_size'
type SortOrder = 'asc' | 'desc'

export function FileList({ refreshTrigger = 0, onFileDeleted }: FileListProps) {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('upload_date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set())

  // Fetch files from database
  const fetchFiles = async () => {
    try {
      setLoading(true)
      const userFiles = await getUserFiles()
      setFiles(userFiles)
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load files on component mount and when refresh trigger changes
  useEffect(() => {
    fetchFiles()
  }, [refreshTrigger])

  // Filter and sort files
  const filteredAndSortedFiles = files
    .filter(file => 
      file.original_name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue: string | number | Date
      let bValue: string | number | Date

      switch (sortField) {
        case 'upload_date':
          aValue = new Date(a.upload_date)
          bValue = new Date(b.upload_date)
          break
        case 'original_name':
          aValue = a.original_name.toLowerCase()
          bValue = b.original_name.toLowerCase()
          break
        case 'file_size':
          aValue = a.file_size
          bValue = b.file_size
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1
      return 0
    })

  // Handle file deletion
  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingFiles(prev => new Set(prev).add(fileId))
      const success = await deleteFile(fileId)
      
      if (success) {
        setFiles(prev => prev.filter(file => file.id !== fileId))
        onFileDeleted?.()
      } else {
        alert('Failed to delete file. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('An error occurred while deleting the file.')
    } finally {
      setDeletingFiles(prev => {
        const next = new Set(prev)
        next.delete(fileId)
        return next
      })
    }
  }

  // Handle file download
  const handleDownload = async (file: FileRecord) => {
    try {
      const downloadUrl = await getFileDownloadURL(file.filename)
      if (downloadUrl) {
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = file.original_name
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        alert('Failed to generate download link. Please try again.')
      }
    } catch (error) {
      console.error('Error downloading file:', error)
      alert('An error occurred while downloading the file.')
    }
  }

  // Toggle sort order
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Files ({files.length})</span>
          <Badge variant="secondary">
            {formatFileSize(files.reduce((total, file) => total + file.file_size, 0))} total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={`${sortField}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-') as [SortField, SortOrder]
            setSortField(field)
            setSortOrder(order)
          }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="upload_date-desc">Newest First</SelectItem>
              <SelectItem value="upload_date-asc">Oldest First</SelectItem>
              <SelectItem value="original_name-asc">Name A-Z</SelectItem>
              <SelectItem value="original_name-desc">Name Z-A</SelectItem>
              <SelectItem value="file_size-desc">Largest First</SelectItem>
              <SelectItem value="file_size-asc">Smallest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* File List */}
        {filteredAndSortedFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No files match your search.' : 'No files uploaded yet.'}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredAndSortedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {file.original_name}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{formatFileSize(file.file_size)}</span>
                    <span>•</span>
                    <span>
                      {new Date(file.upload_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file)}
                    className="flex items-center space-x-1"
                  >
                    <Download className="h-4 w-4" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                    disabled={deletingFiles.has(file.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingFiles.has(file.id) ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
