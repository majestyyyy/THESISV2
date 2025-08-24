'use client'

// Import PDF.js for client-side PDF text extraction
import * as pdfjsLib from 'pdfjs-dist'

// Configure PDF.js worker to use the local version
if (typeof window !== 'undefined') {
  // Use the local worker from public directory
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('/pdfjs/pdf.worker.min.js', window.location.origin).toString()
}

/**
 * Extract text content from PDF file using PDF.js (client-side only)
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  if (typeof window === 'undefined') {
    throw new Error('PDF extraction must be done on the client side')
  }

  try {
    console.log('Starting PDF text extraction for:', file.name)
    
    // Ensure worker is properly configured
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('/pdfjs/pdf.worker.min.js', window.location.origin).toString()
      console.log('Worker configured to:', pdfjsLib.GlobalWorkerOptions.workerSrc)
    }
    
    // Convert file to array buffer
    const arrayBuffer = await file.arrayBuffer()
    
    // Load PDF document with timeout
    const loadingTask = pdfjsLib.getDocument({
      data: arrayBuffer,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true
    })
    
    const pdf = await loadingTask.promise
    
    console.log('PDF loaded, pages:', pdf.numPages)
    
    let extractedText = ''
    
    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      try {
        const page = await pdf.getPage(pageNum)
        const textContent = await page.getTextContent()
        
        // Combine text items with proper spacing
        const pageText = textContent.items
          .map((item: any) => {
            if (item.str) {
              return item.str
            }
            return ''
          })
          .filter(str => str.trim().length > 0)
          .join(' ')
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim()
        
        if (pageText) {
          extractedText += `${pageText}\n\n`
        }
        
        console.log(`Extracted text from page ${pageNum}, length: ${pageText.length}`)
      } catch (pageError) {
        console.error(`Error extracting text from page ${pageNum}:`, pageError)
        // Continue with other pages
      }
    }
    
    const finalText = extractedText.trim()
    console.log('Total extracted text length:', finalText.length)
    
    if (finalText.length === 0) {
      throw new Error('No text content could be extracted from this PDF. The file may contain only images or be password protected.')
    }
    
    if (finalText.length < 50) {
      throw new Error('Very little text was extracted from this PDF. Please ensure the file contains readable text content.')
    }
    
    return finalText
  } catch (error) {
    console.error('PDF text extraction error:', error)
    
    if (error instanceof Error) {
      // Provide more helpful error messages
      if (error.message.includes('Failed to fetch dynamically imported module') || 
          error.message.includes('worker')) {
        throw new Error('PDF processing failed due to worker configuration. Please refresh the page and try again.')
      }
      throw error
    }
    
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid, readable PDF document.')
  }
}
