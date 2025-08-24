// Quiz generation utilities and types
export interface QuizQuestion {
  id: string
  questionText: string
  questionType:
    | "multiple_choice"
    | "true_false"
    | "identification"
    | "fill_in_blanks"
    | "flashcard"
    | "mixed"
  options?: string[]
  correctAnswer: string
  explanation?: string
  difficulty: "easy" | "medium" | "hard"
  blanks?: string[] // For fill_in_blanks questions
  flashcardBack?: string // For flashcard questions
  hints?: string[] // Optional hints for identification questions
}

export interface Quiz {
  id: string
  title: string
  description: string
  fileId: string
  fileName: string
  difficulty: "easy" | "medium" | "hard"
  totalQuestions: number
  questions: QuizQuestion[]
  createdAt: string
}

// Minimal quiz data for listing pages (cards)
export interface QuizListItem {
  id: string
  title: string
  difficulty: "easy" | "medium" | "hard"
  totalQuestions: number
  createdAt: string
}

export interface QuizGenerationOptions {
  fileId: string
  fileName: string
  difficulty: "easy" | "medium" | "hard"
  questionTypes: (
    | "multiple_choice"
    | "true_false"
    | "identification"
    | "fill_in_blanks"
    | "flashcard"
    | "mixed"
  )[]
  numberOfQuestions: number
  focusAreas?: string[]
}

import { generateQuizWithGemini } from "./gemini-utils"
import { supabase } from "./supabase"
import { getCurrentUser } from "./auth"
import type { QuizResult } from "./quiz-session"

// Placeholder AI quiz generation function
export async function generateQuizFromFile(
  options: QuizGenerationOptions,
  fileContent: string,
  onProgress?: (progress: number) => void,
): Promise<Quiz> {
  try {
    // Simulate progress updates
    if (onProgress) onProgress(10)

    // Extract text content and generate quiz using Gemini
    if (onProgress) onProgress(30)

    const geminiQuestions = await generateQuizWithGemini({
      content: fileContent,
      difficulty: options.difficulty,
      questionTypes: options.questionTypes,
      numberOfQuestions: options.numberOfQuestions,
      focusAreas: options.focusAreas,
    })

    if (onProgress) onProgress(80)

    // Convert Gemini response to our Quiz format
    const questions: QuizQuestion[] = geminiQuestions.map((q: any, index: number) => ({
      id: `q${index + 1}`,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: options.difficulty,
      blanks: q.blanks,
      flashcardBack: q.flashcardBack,
      hints: q.hints,
    }))

    if (onProgress) onProgress(100)

    const quiz: Quiz = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Quiz: ${options.fileName}`,
      description: `AI-generated quiz based on ${options.fileName} with ${options.numberOfQuestions} ${options.difficulty} questions.`,
      fileId: options.fileId,
      fileName: options.fileName,
      difficulty: options.difficulty,
      totalQuestions: options.numberOfQuestions,
      questions,
      createdAt: new Date().toISOString(),
    }

    return quiz
  } catch (error) {
    console.error("Error generating quiz:", error)
    // Fallback to mock data if AI generation fails
    return generateMockQuiz(options)
  }
}

// Fallback function for when AI generation fails
function generateMockQuiz(options: QuizGenerationOptions): Quiz {
  const questions: QuizQuestion[] = []

  for (let i = 0; i < options.numberOfQuestions; i++) {
    const questionType = options.questionTypes[i % options.questionTypes.length]

    if (questionType === "multiple_choice") {
      questions.push({
        id: `q${i + 1}`,
        questionText: `Sample multiple choice question ${i + 1} from ${options.fileName}. This question tests your understanding of the key concepts covered in the uploaded material.`,
        questionType: "multiple_choice",
        options: [
          "Option A - This is the correct answer",
          "Option B - This is an incorrect option",
          "Option C - This is another incorrect option",
          "Option D - This is also incorrect",
        ],
        correctAnswer: "Option A - This is the correct answer",
        explanation:
          "This is the correct answer because it directly relates to the main concept discussed in the source material.",
        difficulty: options.difficulty,
      })
    } else if (questionType === "true_false") {
      questions.push({
        id: `q${i + 1}`,
        questionText: `Sample true/false question ${i + 1}: The concept discussed in ${options.fileName} is fundamental to understanding the subject matter.`,
        questionType: "true_false",
        options: ["True", "False"],
        correctAnswer: "True",
        explanation: "This statement is true based on the information provided in the source material.",
        difficulty: options.difficulty,
      })
    } else if (questionType === "identification") {
      questions.push({
        id: `q${i + 1}`,
        questionText: `What is the key term that refers to the fundamental principle discussed in ${options.fileName}?`,
        questionType: "identification",
        correctAnswer: "Core Concept",
        explanation:
          "This term represents the core concept that underlies the entire discussion in the source material.",
        hints: ["It's a fundamental concept", "Related to the main topic"],
        difficulty: options.difficulty,
      })
    } else if (questionType === "fill_in_blanks") {
      questions.push({
        id: `q${i + 1}`,
        questionText: `Fill in the blanks: The _____ is essential for understanding _____ in the context of ${options.fileName}.`,
        questionType: "fill_in_blanks",
        blanks: ["concept", "theory"],
        correctAnswer: "concept, theory",
        explanation: "These terms complete the sentence and represent key ideas from the source material.",
        difficulty: options.difficulty,
      })
    } else if (questionType === "flashcard") {
      questions.push({
        id: `q${i + 1}`,
        questionText: `Key Term from ${options.fileName}`,
        questionType: "flashcard",
        correctAnswer: "Definition",
        flashcardBack: "This is the definition or explanation of the key term discussed in the source material.",
        explanation: "Understanding this term is crucial for grasping the main concepts in the material.",
        difficulty: options.difficulty,
      })
    } else if (questionType === "mixed") {
      // Mixed questions combine multiple formats
      const mixedTypes = ["multiple_choice", "true_false", "identification"]
      const randomType = mixedTypes[Math.floor(Math.random() * mixedTypes.length)] as any

      if (randomType === "multiple_choice") {
        questions.push({
          id: `q${i + 1}`,
          questionText: `Mixed question ${i + 1}: Which of the following best describes the main concept in ${options.fileName}?`,
          questionType: "mixed",
          options: [
            "A comprehensive framework for understanding",
            "A simple definition",
            "An outdated theory",
            "An unrelated concept",
          ],
          correctAnswer: "A comprehensive framework for understanding",
          explanation: "This mixed question tests your overall comprehension of the material.",
          difficulty: options.difficulty,
        })
      } else {
        questions.push({
          id: `q${i + 1}`,
          questionText: `Mixed question ${i + 1}: Explain how the concepts in ${options.fileName} relate to each other.`,
          questionType: "mixed",
          correctAnswer:
            "The concepts are interconnected and build upon each other to form a comprehensive understanding.",
          explanation: "This mixed question requires synthesis of multiple ideas from the source material.",
          difficulty: options.difficulty,
        })
      }
    } else {
      questions.push({
        id: `q${i + 1}`,
        questionText: `Identify the term: What is the main concept discussed in ${options.fileName}?`,
        questionType: "identification",
        correctAnswer: "Main concept from the source material",
        explanation: "This identification question tests your ability to recognize key terms and concepts.",
        difficulty: options.difficulty,
      })
    }
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    title: `Quiz: ${options.fileName}`,
    description: `AI-generated quiz based on ${options.fileName} with ${options.numberOfQuestions} ${options.difficulty} questions.`,
    fileId: options.fileId,
    fileName: options.fileName,
    difficulty: options.difficulty,
    totalQuestions: options.numberOfQuestions,
    questions,
    createdAt: new Date().toISOString(),
  }
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case "easy":
      return "bg-green-100 text-green-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "hard":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export function getQuestionTypeLabel(type: string): string {
  switch (type) {
    case "multiple_choice":
      return "Multiple Choice"
    case "true_false":
      return "True/False"
    case "identification":
      return "Identification"
    case "fill_in_blanks":
      return "Fill in the Blanks"
    case "flashcard":
      return "Flashcard"
    case "mixed":
      return "Mixed Question"
    default:
      return "Unknown"
  }
}

// Database functions for quiz management
export async function saveQuiz(quiz: Quiz): Promise<Quiz> {
  try {
    const { user, error: authError } = await getCurrentUser()
    if (authError || !user) {
      throw new Error("User not authenticated")
    }

    // Prepare questions for JSONB storage
    const questionsJson = quiz.questions.map((question, index) => ({
      id: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      options: question.options || null,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation || null,
      difficulty: question.difficulty
    }))

    // Save the quiz with questions in JSONB column
    const { data: savedQuiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        user_id: user.id,
        file_id: quiz.fileId,
        title: quiz.title,
        description: quiz.description,
        difficulty: quiz.difficulty,
        total_questions: quiz.totalQuestions,
        questions: questionsJson
      })
      .select()
      .single()

    if (quizError) {
      throw new Error(`Failed to save quiz: ${quizError.message}`)
    }

    return {
      ...quiz,
      id: savedQuiz.id,
      createdAt: savedQuiz.created_at
    }
  } catch (error) {
    console.error("Error saving quiz:", error)
    throw error
  }
}

export async function getUserQuizzes(userId: string): Promise<Quiz[]> {
  try {
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        files(original_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch quizzes: ${error.message}`)
    }

    return quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      description: quiz.description || '',
      fileId: quiz.file_id,
      fileName: quiz.files?.original_name || 'Unknown File',
      difficulty: quiz.difficulty as "easy" | "medium" | "hard",
      totalQuestions: quiz.total_questions,
      questions: quiz.questions || [], // Load questions from JSONB column
      createdAt: quiz.created_at
    }))
  } catch (error) {
    console.error("Error fetching user quizzes:", error)
    throw error
  }
}

// Optimized function to fetch minimal quiz data for listing pages
export async function getUserQuizzesList(userId: string): Promise<QuizListItem[]> {
  try {
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('id, title, difficulty, total_questions, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch quizzes list: ${error.message}`)
    }

    return quizzes.map(quiz => ({
      id: quiz.id,
      title: quiz.title,
      difficulty: quiz.difficulty as "easy" | "medium" | "hard",
      totalQuestions: quiz.total_questions,
      createdAt: quiz.created_at
    }))
  } catch (error) {
    console.error("Error fetching user quizzes list:", error)
    throw error
  }
}

export async function getQuizById(quizId: string): Promise<Quiz | null> {
  try {
    if (!quizId) {
      console.error("Quiz ID is required")
      return null
    }

    console.log("Fetching quiz with ID:", quizId)
    
    // Add a small delay to ensure Supabase client is ready
    await new Promise(resolve => setTimeout(resolve, 50))
    
    // Get quiz details with questions from JSONB column
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .select(`
        *,
        files(original_name)
      `)
      .eq('id', quizId)
      .single()

    if (quizError || !quiz) {
      console.error('Error fetching quiz:', quizError)
      return null
    }

    console.log("Quiz data fetched successfully:", quiz)

    // Parse questions from JSONB
    const quizQuestions: QuizQuestion[] = (quiz.questions || []).map((q: any) => ({
      id: q.id,
      questionText: q.questionText,
      questionType: q.questionType as QuizQuestion['questionType'],
      options: q.options || undefined,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || undefined,
      difficulty: q.difficulty as "easy" | "medium" | "hard"
    }))

    return {
      id: quiz.id,
      title: quiz.title,
      description: quiz.description || '',
      fileId: quiz.file_id,
      fileName: quiz.files?.original_name || 'Unknown File',
      difficulty: quiz.difficulty as "easy" | "medium" | "hard",
      totalQuestions: quiz.total_questions,
      questions: quizQuestions,
      createdAt: quiz.created_at
    }
  } catch (error) {
    console.error("Error fetching quiz:", error)
    return null
  }
}
