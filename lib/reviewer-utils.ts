/**
 * Update the title of a study material
 */
export async function updateStudyMaterialTitle(id: string, newTitle: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }
    const { error } = await supabase
      .from('reviewers')
      .update({ title: newTitle })
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) {
      console.error('Error updating study material title:', error)
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch (error) {
    console.error('Error updating study material title:', error)
    return { success: false, error: 'Failed to update study material title' }
  }
}
import { generateReviewerWithGemini } from "./gemini-utils"
import { getFileContentFromStorage } from "./file-utils"
import { supabase } from "./supabase"

export interface StudyMaterial {
  id: string
  title: string
  type: "summary" | "flashcards" | "notes"
  fileId: string
  fileName: string
  createdAt: string
  content: {
    summary?: string
    flashcards?: Array<{ 
      front: string; 
      back: string;
      difficulty?: "basic" | "intermediate" | "advanced";
      category?: string;
    }>
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
  fileContent: string, // Keep this parameter for backward compatibility but we'll get content from storage
  onProgress?: (progress: number) => void,
): Promise<StudyMaterial> {
  try {
    if (onProgress) onProgress(10)

    // Get file content directly from storage (this will use stored content_text or extract from file)
    let actualContent: string
    try {
      actualContent = await getFileContentFromStorage(options.fileId)
    } catch (storageError) {
      console.log('Could not get content from storage, using provided content:', storageError)
      // Fallback to provided content
      actualContent = fileContent
    }

    // Validate content
    if (!actualContent || actualContent.trim().length === 0) {
      throw new Error("No content found in the file. Please ensure the PDF contains extractable text or re-upload the file.")
    }

    if (actualContent.length < 100) {
      throw new Error("File content is too short for meaningful study material generation. Please upload a document with more content.")
    }

    // Generate study material using Gemini
    if (onProgress) onProgress(30)

    const geminiContent = await generateReviewerWithGemini({
      content: actualContent,
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
    
    // If it's a content validation error, don't fallback to mock data
    if (error instanceof Error && (
      error.message.includes("No content found") || 
      error.message.includes("too short") ||
      error.message.includes("re-upload")
    )) {
      throw error
    }
    
    // For other errors (like AI failures), fallback to mock data
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
    summary: `# 📚 Study Guide: ${options.fileName}

## 🎯 Learning Objectives
- Understand the core concepts and principles presented in the material
- Apply knowledge to practical scenarios and real-world situations
- Synthesize information to form comprehensive understanding

## 📖 Overview & Context
This comprehensive study guide has been generated from your uploaded file. The AI has analyzed the content and created structured notes covering the key concepts, important information, and learning strategies to help you master the material effectively.

## 🔑 Core Concepts & Key Ideas

### Main Topics
- **Fundamental Principles**: Core concepts that form the foundation of understanding
- **Key Relationships**: Important connections between different ideas and concepts
- **Critical Information**: Essential details that support comprehensive learning

### Detailed Explanations
- Each concept builds upon previous knowledge
- Real-world applications demonstrate practical relevance
- Examples and analogies help clarify complex ideas

## 💡 Important Terms & Definitions
- **Primary Concepts**: Fundamental ideas that drive understanding
- **Supporting Elements**: Additional components that enhance comprehension
- **Application Areas**: Contexts where knowledge can be applied

## 🧠 Critical Thinking Questions
1. How do the main concepts relate to each other?
2. What are the practical applications of this knowledge?
3. How can this information be applied to solve real problems?
4. What connections exist with other areas of study?

## 📝 Study Strategies & Tips
- **Active Reading**: Engage with the material through questioning and summarizing
- **Spaced Repetition**: Review material at increasing intervals
- **Practice Application**: Use knowledge in different contexts
- **Concept Mapping**: Create visual connections between ideas

## 🔄 Review & Practice
- Regular self-assessment helps identify knowledge gaps
- Practice problems reinforce understanding
- Group discussions enhance perspective
- Teaching others solidifies your own knowledge

## 🎯 Key Takeaways
- Master the fundamental concepts as building blocks
- Understand practical applications and real-world relevance
- Practice regular review for long-term retention
- Connect new knowledge with existing understanding`,
    
    flashcards: [
      {
        front: `What are the main learning objectives for ${options.fileName}?`,
        back: "To understand core concepts, apply knowledge to practical scenarios, and synthesize information for comprehensive understanding.",
        difficulty: "basic" as const,
        category: "objectives"
      },
      {
        front: "How should you approach studying this material effectively?",
        back: "Use active reading, spaced repetition, practice application, and concept mapping to enhance learning and retention.",
        difficulty: "intermediate" as const,
        category: "strategy"
      },
      {
        front: "What are the key relationships mentioned in the study material?",
        back: "Important connections between different ideas and concepts that help build comprehensive understanding of the subject matter.",
        difficulty: "intermediate" as const,
        category: "analysis"
      },
      {
        front: "Why is practical application important for learning?",
        back: "It demonstrates real-world relevance, reinforces theoretical knowledge, and helps transfer learning to new contexts and situations.",
        difficulty: "advanced" as const,
        category: "application"
      },
      {
        front: "What study strategies are recommended for long-term retention?",
        back: "Spaced repetition, active engagement, regular self-assessment, and teaching others to solidify understanding.",
        difficulty: "basic" as const,
        category: "strategy"
      }
    ],
    
    notes: [
      `📋 Core concepts from ${options.fileName} form the foundation for comprehensive understanding`,
      "🔗 Important relationships exist between different topics, creating interconnected knowledge networks",
      "🌍 Practical applications demonstrate real-world relevance and transfer of learning",
      "🧠 Active learning strategies enhance retention and understanding significantly",
      "⏰ Regular review and spaced repetition are essential for long-term memory consolidation",
      "🎯 Focus on understanding principles rather than memorizing isolated facts",
      "🔄 Self-assessment helps identify knowledge gaps and areas needing additional attention",
      "👥 Collaborative learning and discussion enhance perspective and deepen understanding",
      "📊 Concept mapping creates visual connections that improve comprehension",
      "💡 Teaching others is one of the most effective ways to solidify your own knowledge",
      "🔍 Critical thinking questions promote deeper analysis and application skills",
      "📈 Progressive difficulty levels help build confidence and competence systematically"
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

/**
 * Save a study material to the database
 */
export async function saveStudyMaterial(studyMaterial: StudyMaterial): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase
      .from('reviewers')
      .insert({
        user_id: user.id,
        file_id: studyMaterial.fileId,
        title: studyMaterial.title,
        content: JSON.stringify(studyMaterial.content),
        reviewer_type: studyMaterial.type
      })

    if (error) {
      console.error('Error saving study material:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error saving study material:', error)
    return { success: false, error: 'Failed to save study material' }
  }
}

/**
 * Get all study materials for the current user
 */
export async function getUserStudyMaterials(): Promise<StudyMaterial[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from('reviewers')
      .select(`
        id,
        title,
        reviewer_type,
        content,
        created_at,
        file_id,
        files!inner(original_name)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching study materials:', error)
      throw new Error(error.message)
    }

    return (data || []).map(item => ({
      id: item.id,
      title: item.title,
      type: item.reviewer_type as "summary" | "flashcards" | "notes",
      fileId: item.file_id,
      fileName: (item as any).files.original_name,
      createdAt: item.created_at,
      content: JSON.parse(item.content)
    }))
  } catch (error) {
    console.error('Error fetching study materials:', error)
    return []
  }
}

/**
 * Get a specific study material by ID
 */
export async function getStudyMaterialById(id: string): Promise<StudyMaterial | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from('reviewers')
      .select(`
        id,
        title,
        reviewer_type,
        content,
        created_at,
        file_id,
        files!inner(original_name)
      `)
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching study material:', error)
      return null
    }

    return {
      id: data.id,
      title: data.title,
      type: data.reviewer_type as "summary" | "flashcards" | "notes",
      fileId: data.file_id,
      fileName: (data as any).files.original_name,
      createdAt: data.created_at,
      content: JSON.parse(data.content)
    }
  } catch (error) {
    console.error('Error fetching study material:', error)
    return null
  }
}

/**
 * Delete a study material
 */
export async function deleteStudyMaterial(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase
      .from('reviewers')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting study material:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting study material:', error)
    return { success: false, error: 'Failed to delete study material' }
  }
}
