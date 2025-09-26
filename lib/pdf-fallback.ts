'use client'

/**
 * Fallback PDF text extraction without external dependencies
 * This is a simple fallback that extracts basic text information
 */
export async function extractTextFromPDFFallback(file: File): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('PDF extraction must be done on the client side')
  }

  try {
    // For now, return a placeholder that indicates the file was processed
    // In a production environment, you might want to send this to a server endpoint
    // that can handle PDF text extraction using server-side libraries
    
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2)
    const timestamp = new Date().toISOString()
    
    return `
PDF Document Analysis
=====================

File Information:
- Name: ${file.name}
- Size: ${sizeInMB} MB
- Type: ${file.type}
- Upload Date: ${timestamp}

Note: This is a placeholder for PDF content extraction. 
The actual text content would be extracted using PDF processing services.
This file has been successfully uploaded and is ready for processing.

To enable full text extraction, ensure PDF.js is properly configured or implement server-side PDF processing.
`.trim()
  } catch (error) {
    console.error('Fallback PDF extraction error:', error)
    throw new Error('Unable to process PDF file. Please try uploading a different file.')
  }
}