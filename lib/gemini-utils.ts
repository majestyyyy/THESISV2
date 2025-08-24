import { GoogleGenerativeAI } from "@google/generative-ai"

const apiKey = process.env.GEMINI_API_KEY || "AIzaSyCfoVpVtoHQ18KihATj0QHHu31upGzuIGM"

if (!apiKey) {
  throw new Error("GEMINI_API_KEY environment variable is required")
}

const genAI = new GoogleGenerativeAI(apiKey)

export interface GenerateQuizOptions {
  content: string
  difficulty: "easy" | "medium" | "hard"
  questionTypes: ("multiple_choice" | "true_false" | "identification" | "fill_in_blanks" | "flashcard" | "mixed")[]
  numberOfQuestions: number
  focusAreas?: string[]
}

export interface GenerateReviewerOptions {
  content: string
  type: "summary" | "flashcards" | "notes"
  focusAreas?: string[]
}

export async function generateQuizWithGemini(options: GenerateQuizOptions) {
  if (!apiKey || apiKey === "your-api-key-here") {
    throw new Error("Please configure a valid GEMINI_API_KEY environment variable")
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) // Updated to use gemini-1.5-flash model

  const questionTypesStr = options.questionTypes.join(", ")
  const focusAreasStr = options.focusAreas?.length ? `Focus on these areas: ${options.focusAreas.join(", ")}. ` : ""

  const prompt = `
You are an expert educational content creator. Generate a quiz based on the following content.

Content to analyze:
${options.content}

Requirements:
- Generate exactly ${options.numberOfQuestions} questions
- Difficulty level: ${options.difficulty}
- Question types: ${questionTypesStr}
- ${focusAreasStr}

For each question, provide:
1. Question text
2. Question type (multiple_choice, true_false, or identification)
3. For multiple choice: 4 options with one correct answer
4. For true/false: "True" or "False" as the correct answer
5. For identification: a specific term, concept, or name to identify. The question should ask "What is..." or "Identify..." or "Name the..." and the correct answer should be a single term or short phrase (1-3 words maximum)
6. A brief explanation of why the answer is correct

Format your response as a JSON array with this structure:
[
  {
    "questionText": "Question here",
    "questionType": "multiple_choice",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Explanation here"
  },
  {
    "questionText": "What is the powerhouse of the cell?",
    "questionType": "identification",
    "correctAnswer": "Mitochondria",
    "explanation": "Explanation here"
  }
]

Make sure the questions test understanding of key concepts from the content.
`

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Extract JSON from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error("Could not parse quiz questions from AI response")
    }

    const questions = JSON.parse(jsonMatch[0])
    return questions
  } catch (error) {
    console.error("Error generating quiz with Gemini:", error)
    throw new Error("Failed to generate quiz questions")
  }
}

export async function generateReviewerWithGemini(options: GenerateReviewerOptions) {
  if (!apiKey || apiKey === "your-api-key-here") {
    throw new Error("Please configure a valid GEMINI_API_KEY environment variable")
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) // Updated to use gemini-1.5-flash model

  let prompt = ""
  const focusAreasStr = options.focusAreas?.length ? `Focus on these areas: ${options.focusAreas.join(", ")}. ` : ""

  switch (options.type) {
    case "summary":
      prompt = `
You are an expert educational content creator. Create a comprehensive study guide based on the following content.

Content to analyze:
${options.content}

${focusAreasStr}

Create a well-structured study guide with:
1. Overview/Introduction
2. Key Concepts (organized with headings and subheadings)
3. Important Terms and Definitions
4. Study Tips
5. Review Questions
6. Key Takeaways

Format using markdown with proper headings (# ## ###) and bullet points.
Make it comprehensive but easy to understand.
`
      break

    case "flashcards":
      prompt = `
You are an expert educational content creator. Create flashcards based on the following content.

Content to analyze:
${options.content}

${focusAreasStr}

Generate 10-15 flashcards covering the most important concepts.

Format your response as a JSON array with this structure:
[
  {
    "front": "Question or term",
    "back": "Answer or definition"
  }
]

Make sure each flashcard tests a key concept or definition from the content.
`
      break

    case "notes":
      prompt = `
You are an expert educational content creator. Create concise study notes based on the following content.

Content to analyze:
${options.content}

${focusAreasStr}

Generate 8-12 key points that capture the most important information.
Each point should be a concise, memorable statement.

Format your response as a JSON array of strings:
["Key point 1", "Key point 2", ...]

Make each point clear, concise, and focused on essential information.
`
      break
  }

  try {
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    if (options.type === "summary") {
      return { summary: text }
    } else {
      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (!jsonMatch) {
        throw new Error("Could not parse content from AI response")
      }

      const content = JSON.parse(jsonMatch[0])
      return options.type === "flashcards" ? { flashcards: content } : { notes: content }
    }
  } catch (error) {
    console.error("Error generating reviewer with Gemini:", error)
    throw new Error("Failed to generate study material")
  }
}
