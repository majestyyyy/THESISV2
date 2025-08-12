// File processing utilities
export interface FileUpload {
  id: string
  file: File
  progress: number
  status: "uploading" | "processing" | "completed" | "error"
  error?: string
  extractedText?: string
}

export const SUPPORTED_FILE_TYPES = {
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/msword": ".doc",
  "text/plain": ".txt",
}

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!Object.keys(SUPPORTED_FILE_TYPES).includes(file.type)) {
    return {
      valid: false,
      error: "Unsupported file type. Please upload PDF, DOCX, DOC, or TXT files.",
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: "File size too large. Please upload files smaller than 10MB.",
    }
  }

  return { valid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

export function getFileIcon(fileType: string): string {
  switch (fileType) {
    case "application/pdf":
      return "📄"
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    case "application/msword":
      return "📝"
    case "text/plain":
      return "📃"
    default:
      return "📄"
  }
}

// Placeholder text extraction function
export async function extractTextFromFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    // Simulate text extraction process
    setTimeout(() => {
      const mockText = `Extracted text from ${file.name}. This is a placeholder implementation that would normally use libraries like pdf-parse for PDFs, mammoth for DOCX files, or simple text reading for TXT files. The actual implementation would process the file content and return the extracted text for AI processing.`
      resolve(mockText)
    }, 2000)
  })
}

// Placeholder file upload function
export async function uploadFile(
  file: File,
  onProgress: (progress: number) => void,
): Promise<{ id: string; url: string }> {
  return new Promise((resolve, reject) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        onProgress(progress)
        resolve({
          id: Math.random().toString(36).substr(2, 9),
          url: `/uploads/${file.name}`,
        })
      } else {
        onProgress(progress)
      }
    }, 200)
  })
}
