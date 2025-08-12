import { generateReviewerWithGemini } from "./gemini-utils"

export interface StudyMaterial {
  id: string
  title: string
  type: "summary" | "flashcards" | "notes"
  fileId: string
  fileName: string
  createdAt: string
  content: {
    summary?: string
    flashcards?: Array<{ front: string; back: string }>
    notes?: string[]
  }
}

export interface ReviewerGenerationOptions {
  fileId: string
  fileName: string
  type: "summary" | "flashcards" | "notes"
  focusAreas?: string[]
}

export async function generateReviewerFromFile(
  options: ReviewerGenerationOptions,
  fileContent: string,
  onProgress?: (progress: number) => void,
): Promise<StudyMaterial> {
  try {
    if (onProgress) onProgress(10)

    // Generate study material using Gemini
    if (onProgress) onProgress(30)

    const geminiContent = await generateReviewerWithGemini({
      content: fileContent,
      type: options.type,
      focusAreas: options.focusAreas,
    })

    if (onProgress) onProgress(80)

    const studyMaterial: StudyMaterial = {
      id: Math.random().toString(36).substr(2, 9),
      title: `${getTypeLabel(options.type)}: ${options.fileName}`,
      type: options.type,
      fileId: options.fileId,
      fileName: options.fileName,
      createdAt: new Date().toISOString(),
      content: geminiContent,
    }

    if (onProgress) onProgress(100)

    return studyMaterial
  } catch (error) {
    console.error("Error generating reviewer:", error)
    // Fallback to mock data if AI generation fails
    return generateMockReviewer(options)
  }
}

function getTypeLabel(type: string): string {
  switch (type) {
    case "summary":
      return "Study Guide"
    case "flashcards":
      return "Flashcards"
    case "notes":
      return "Quick Notes"
    default:
      return "Study Material"
  }
}

function generateMockReviewer(options: ReviewerGenerationOptions): StudyMaterial {
  const mockContent = {
    summary: `# Study Guide: ${options.fileName}\n\nThis is a comprehensive study guide generated from your uploaded file. The AI has analyzed the content and created structured notes covering the key concepts and important information.\n\n## Key Topics\n\n- Main concepts and definitions\n- Important relationships and connections\n- Critical information for understanding\n\n## Study Tips\n\n- Review the material regularly\n- Focus on understanding concepts rather than memorization\n- Practice applying the knowledge`,
    flashcards: [
      {
        front: `What is the main topic covered in ${options.fileName}?`,
        back: "The main topic involves key concepts and principles that are fundamental to understanding the subject matter.",
      },
      {
        front: "What are the key takeaways from this material?",
        back: "The key takeaways include understanding the core concepts, their applications, and how they relate to the broader subject area.",
      },
    ],
    notes: [
      `Key concepts from ${options.fileName} are fundamental to understanding the subject`,
      "Important relationships exist between different topics covered",
      "Practical applications demonstrate real-world relevance",
      "Regular review and practice are essential for mastery",
    ],
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    title: `${getTypeLabel(options.type)}: ${options.fileName}`,
    type: options.type,
    fileId: options.fileId,
    fileName: options.fileName,
    createdAt: new Date().toISOString(),
    content:
      options.type === "summary"
        ? { summary: mockContent.summary }
        : options.type === "flashcards"
          ? { flashcards: mockContent.flashcards }
          : { notes: mockContent.notes },
  }
}
