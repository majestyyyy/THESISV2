// Quiz generation utilities and types
export interface QuizQuestion {
  id: string
  questionText: string
  questionType:
    | "multiple_choice"
    | "true_false"
    | "short_answer"
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

export interface QuizGenerationOptions {
  fileId: string
  fileName: string
  difficulty: "easy" | "medium" | "hard"
  questionTypes: (
    | "multiple_choice"
    | "true_false"
    | "short_answer"
    | "identification"
    | "fill_in_blanks"
    | "flashcard"
    | "mixed"
  )[]
  numberOfQuestions: number
  focusAreas?: string[]
}

import { generateQuizWithGemini } from "./gemini-utils"

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
        questionText: `Identify the key term: This concept refers to the fundamental principle discussed in ${options.fileName}.`,
        questionType: "identification",
        correctAnswer: "Sample Key Term",
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
      const mixedTypes = ["multiple_choice", "true_false", "short_answer", "identification"]
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
        questionText: `Sample short answer question ${i + 1}: Explain the main concept from ${options.fileName} in your own words.`,
        questionType: "short_answer",
        correctAnswer:
          "The main concept involves understanding the fundamental principles and their practical applications as outlined in the source material.",
        explanation: "A good answer should demonstrate understanding of the core concepts and their relationships.",
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
    case "short_answer":
      return "Short Answer"
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
