import { supabase } from './supabase'
import type { Database } from './supabase'

type FileRecord = Database['public']['Tables']['files']['Row']
type FileInsert = Database['public']['Tables']['files']['Insert']

export interface UploadResult {
  success: boolean
  fileId?: string
  error?: string
  file?: FileRecord
}

export interface FileValidationResult {
  isValid: boolean
  error?: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// File validation constants
export const FILE_CONSTRAINTS = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB in bytes
  ALLOWED_TYPES: ['application/pdf'] as const,
  ALLOWED_EXTENSIONS: ['.pdf'] as const
} as const

// Export FileRecord type for other components
export type { FileRecord }

/**
 * Validate uploaded file for PDF type and size constraints
 */
export function validateFile(file: File): FileValidationResult {
  // Check file type
  if (!FILE_CONSTRAINTS.ALLOWED_TYPES.includes(file.type as any)) {
    return {
      isValid: false,
      error: 'Only PDF files are allowed'
    }
  }

  // Check file extension as additional validation
  const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
  if (!FILE_CONSTRAINTS.ALLOWED_EXTENSIONS.includes(extension as any)) {
    return {
      isValid: false,
      error: 'File must have a .pdf extension'
    }
  }

  // Check file size
  if (file.size > FILE_CONSTRAINTS.MAX_SIZE) {
    const maxSizeMB = FILE_CONSTRAINTS.MAX_SIZE / (1024 * 1024)
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeMB}MB`
    }
  }

  // Check if file is not empty
  if (file.size === 0) {
    return {
      isValid: false,
      error: 'File cannot be empty'
    }
  }

  return { isValid: true }
}

/**
 * Generate a unique filename for storage
 */
function generateUniqueFilename(originalName: string, userId: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 8)
  const extension = originalName.slice(originalName.lastIndexOf('.'))
  return `${userId}/${timestamp}-${randomString}${extension}`
}

/**
 * Extract text content from PDF file (client-side only)
 */
async function extractTextFromPDF(file: File): Promise<string> {
  // Dynamic import to ensure this only runs on client-side
  if (typeof window === 'undefined') {
    // Server-side fallback - return placeholder that will be processed later
    return `[PDF content to be extracted on client-side - File: ${file.name}, Size: ${file.size} bytes]`
  }

  try {
    const { extractTextFromPDF: clientExtractText } = await import('./pdf-utils')
    return await clientExtractText(file)
  } catch (error) {
    console.error('PDF extraction failed:', error)
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF document.')
  }
}

/**
 * Upload PDF file to Supabase Storage with progress tracking
 */
export async function uploadPDFFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    // Validate file first
    const validation = validateFile(file)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error
      }
    }

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return {
        success: false,
        error: 'User not authenticated. Please sign in again.'
      }
    }

    // Generate unique filename
    const filename = generateUniqueFilename(file.name, user.id)
    
    onProgress?.({ loaded: 0, total: file.size, percentage: 0 })

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filename, file, {
        cacheControl: '3600',
        upsert: false,
        duplex: 'half'
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      if (uploadError.message?.includes('Bucket not found')) {
        return {
          success: false,
          error: 'Storage bucket not configured. Please contact support.'
        }
      }
      if (uploadError.message?.includes('Policy')) {
        return {
          success: false,
          error: 'Upload permission denied. Please check your account.'
        }
      }
      return {
        success: false,
        error: `Upload failed: ${uploadError.message}`
      }
    }

    onProgress?.({ loaded: file.size * 0.8, total: file.size, percentage: 80 })

    // Extract text content (placeholder for now)
    const contentText = await extractTextFromPDF(file)

    onProgress?.({ loaded: file.size * 0.9, total: file.size, percentage: 90 })

    // Save file metadata to database
    const fileRecord: FileInsert = {
      user_id: user.id,
      filename: uploadData.path,
      original_name: file.name,
      file_type: file.type,
      file_size: file.size,
      content_text: contentText
    }

    const { data: dbData, error: dbError } = await supabase
      .from('files')
      .insert(fileRecord)
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      
      // Clean up uploaded file if database insert fails
      await supabase.storage
        .from('documents')
        .remove([filename])

      return {
        success: false,
        error: 'Failed to save file information. Please try again.'
      }
    }

    onProgress?.({ loaded: file.size, total: file.size, percentage: 100 })

    // Log upload activity
    await supabase.from('analytics').insert({
      user_id: user.id,
      action_type: 'file_uploaded',
      resource_id: dbData.id,
      metadata: {
        filename: file.name,
        file_size: file.size,
        file_type: file.type
      }
    })

    return {
      success: true,
      fileId: dbData.id,
      file: dbData
    }

  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred during upload. Please try again.'
    }
  }
}

/**
 * Get download URL for a file
 */
export async function getFileDownloadURL(filename: string): Promise<string | null> {
  try {
    const { data } = await supabase.storage
      .from('documents')
      .createSignedUrl(filename, 3600) // 1 hour expiry

    return data?.signedUrl || null
  } catch (error) {
    console.error('Error getting download URL:', error)
    return null
  }
}

/**
 * Delete file from storage and database
 */
export async function deleteFile(fileId: string): Promise<boolean> {
  try {
    // Get file info from database
    const { data: fileData, error: fetchError } = await supabase
      .from('files')
      .select('filename')
      .eq('id', fileId)
      .single()

    if (fetchError || !fileData) {
      console.error('Error fetching file info:', fetchError)
      return false
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([fileData.filename])

    if (storageError) {
      console.error('Error deleting from storage:', storageError)
      return false
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)

    if (dbError) {
      console.error('Error deleting from database:', dbError)
      return false
    }

    return true
  } catch (error) {
    console.error('Delete error:', error)
    return false
  }
}

/**
 * Get user's uploaded files
 */
export async function getUserFiles() {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .order('upload_date', { ascending: false })

    if (error) {
      console.error('Error fetching user files:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching user files:', error)
    return []
  }
}

/**
 * Read file content directly from storage for processing
 */
export async function getFileContentFromStorage(fileId: string): Promise<string> {
  try {
    // Get file info from database
    const { data: fileData, error: fetchError } = await supabase
      .from('files')
      .select('filename, original_name, content_text')
      .eq('id', fileId)
      .single()

    if (fetchError || !fileData) {
      throw new Error('File not found or access denied')
    }

    // First try to use the stored content_text if available and substantial
    if (fileData.content_text && 
        fileData.content_text.trim().length > 100 && 
        !fileData.content_text.includes('[PDF content will be extracted here') &&
        !fileData.content_text.includes('[PDF content to be extracted on client-side')) {
      console.log('Using stored content_text, length:', fileData.content_text.length)
      return fileData.content_text
    }

    // If no stored content or it's a placeholder, try to download and extract from the file
    console.log('Attempting to download and extract PDF content for:', fileData.original_name)
    
    if (typeof window === 'undefined') {
      throw new Error('PDF text extraction requires client-side processing. Please refresh the page and try again.')
    }
    
    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from('documents')
      .download(fileData.filename)

    if (downloadError || !fileBlob) {
      throw new Error('Failed to download file from storage')
    }

    // Convert blob to File object for PDF processing
    const file = new File([fileBlob], fileData.original_name, { type: 'application/pdf' })
    
    // Extract text content using client-side PDF processing
    const { extractTextFromPDF: clientExtractText } = await import('./pdf-utils')
    const extractedText = await clientExtractText(file)
    
    // Update the database with the extracted content for future use
    try {
      await supabase
        .from('files')
        .update({ content_text: extractedText })
        .eq('id', fileId)
      
      console.log('Updated database with extracted content')
    } catch (updateError) {
      console.warn('Failed to update database with extracted content:', updateError)
      // Don't throw here, we still have the content
    }
    
    return extractedText

  } catch (error) {
    console.error('Error reading file content:', error)
    throw error
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
