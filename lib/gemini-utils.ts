const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "AIzaSyCfoVpVtoHQ18KihATj0QHHu31upGzuIGM"

if (!apiKey) {
  console.warn("NEXT_PUBLIC_GEMINI_API_KEY environment variable is not set")
}

async function getGeminiAI() {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    return new GoogleGenerativeAI(apiKey)
  } catch (error) {
    console.error("Failed to load Google Generative AI:", error)
    throw new Error("Google Generative AI is not available")
  }
}

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

  const genAI = await getGeminiAI()
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) // Updated to use gemini-2.0-flash model

  const questionTypesStr = options.questionTypes.join(", ")
  const focusAreasStr = options.focusAreas?.length ? `Focus on these areas: ${options.focusAreas.join(", ")}. ` : ""
  
  // Create specific instructions for each question type
  const typeInstructions = options.questionTypes.map(type => {
    switch(type) {
      case 'multiple_choice': return '- For multiple_choice: 4 options with one correct answer'
      case 'true_false': return '- For true_false: must include options ["True", "False"] and correctAnswer must be either "True" or "False"'
      case 'identification': return '- For identification: a specific term, concept, or name to identify. The question should ask "What is..." or "Identify..." or "Name the..." and the correct answer should be a single term or short phrase (1-3 words maximum)'
      case 'fill_in_blanks': return '- For fill_in_blanks: provide a sentence with one blank to fill'
      default: return ''
    }
  }).filter(Boolean).join('\n')

  const prompt = `
You are an expert educational content creator. Generate a quiz based on the following content.

Content to analyze:
${options.content}

Requirements:
- Generate exactly ${options.numberOfQuestions} questions
- Difficulty level: ${options.difficulty}
- Question types MUST ONLY be from these selected types: ${questionTypesStr}
- ${focusAreasStr}

CRITICAL: You MUST only generate questions using the specified question types: ${questionTypesStr}. Do NOT create any other question types.

For each question, provide:
1. Question text
2. Question type (ONLY from: ${questionTypesStr})
3. Answer format based on the specific question type:
${typeInstructions}
4. A detailed, pedagogical explanation of why the answer is correct, including:
   - The reasoning behind the answer
   - Key concepts or facts from the content that support the answer
   - Common misconceptions and why they are incorrect
   - Tips or memory aids to help students remember the concept

IMPORTANT: Do NOT use phrases like "the text describes", "provided by the text", "according to the text", or similar references to the source material in your explanations. Write explanations as standalone educational content.

Format your response as a JSON array. Here are examples for each allowed question type:

${options.questionTypes.includes('multiple_choice') ? `Multiple Choice Example:
{
  "questionText": "Which of the following best describes...?",
  "questionType": "multiple_choice",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Detailed explanation here"
}` : ''}

${options.questionTypes.includes('true_false') ? `True/False Example:
{
  "questionText": "The statement XYZ is correct.",
  "questionType": "true_false",
  "options": ["True", "False"],
  "correctAnswer": "True",
  "explanation": "Detailed explanation here"
}` : ''}

${options.questionTypes.includes('identification') ? `Identification Example:
{
  "questionText": "What is the term for...?",
  "questionType": "identification",
  "correctAnswer": "Short Answer",
  "explanation": "Detailed explanation here"
}` : ''}

REMEMBER: Only generate questions with questionType values from this list: ${questionTypesStr}

Make sure the questions test understanding of key concepts from the content. Explanations should be clear, thorough, and help students learn and retain the material. Do not reference the source text in your explanations.
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
    
    // Validate that all questions use only the requested question types
    const allowedTypes = options.questionTypes
    const filteredQuestions = questions.filter((question: any) => {
      if (!allowedTypes.includes(question.questionType)) {
        console.warn(`Filtered out question with unauthorized type: ${question.questionType}. Only allowed: ${allowedTypes.join(', ')}`)
        return false
      }
      return true
    })
    
    // If we lost too many questions due to filtering, log a warning
    if (filteredQuestions.length < questions.length) {
      console.warn(`Filtered ${questions.length - filteredQuestions.length} questions with unauthorized types`)
    }
    
    return filteredQuestions
  } catch (error) {
    console.error("Error generating quiz with Gemini:", error)
    throw new Error("Failed to generate quiz questions")
  }
}

export async function generateReviewerWithGemini(options: GenerateReviewerOptions) {
  if (!apiKey || apiKey === "your-api-key-here") {
    throw new Error("Please configure a valid GEMINI_API_KEY environment variable")
  }

  // Debug: Log content length and sample
  console.log("Generating reviewer with content length:", options.content.length)
  console.log("Content sample (first 200 chars):", options.content.substring(0, 200))

  const genAI = await getGeminiAI()
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }) // Updated to use gemini-2.0-flash model

  let prompt = ""
  const focusAreasStr = options.focusAreas?.length ? `Focus on these areas: ${options.focusAreas.join(", ")}. ` : ""

  switch (options.type) {
    case "summary":
      prompt = `
You are a world-class educational content creator and study strategist. I am providing you with extracted text content from a document, and you need to create an exceptional, comprehensive study guide from this content.

IMPORTANT: Do NOT ask for the PDF or request additional content. Work with the text content provided below to create the study guide.

Document content to analyze and create study guide from:
${options.content}

${focusAreasStr}

Your task is to create a masterful study guide with the following structure using ONLY the content provided above:

# 📚 Study Guide: [Create an engaging title based on the content]

## 🎯 Learning Objectives
- List 3-5 specific learning outcomes students should achieve from this material

## 📖 Overview & Context
- Provide engaging background about the topic covered
- Explain why this material matters and its broader significance

## 🔑 Core Concepts & Key Ideas
[Organize the main concepts from the content into logical sections]
- Use bullet points, numbered lists, and sub-sections
- Include detailed explanations with examples from the content
- Add memory aids and mnemonics where helpful

## 💡 Important Terms & Definitions
[Extract and present key terms from the content as a glossary]
- Term: Clear definition with context from the material
- Include explanations that help with understanding

## 🧠 Critical Thinking Questions
- 5-7 thought-provoking questions based on the content
- Include both factual recall and application questions

## 📝 Study Strategies & Tips
- Specific techniques for mastering this particular material
- Active learning suggestions tailored to the content
- Common pitfalls to avoid based on the subject matter

## 🔄 Review & Practice
- Self-assessment questions derived from the content
- Quick review checklist of key points
- Spaced repetition schedule suggestions

## 🎯 Key Takeaways
- 3-5 most important points from the material
- How this content connects to broader concepts

Format using rich markdown with emojis, proper headings (# ## ###), bullet points, **bold**, *italics*, and > blockquotes for emphasis.
Create an engaging, comprehensive, and pedagogically sound study guide based entirely on the provided content.
`
      break

    case "flashcards":
      prompt = `
You are an expert educational psychologist specializing in spaced repetition and active recall. I am providing you with extracted text content from a document, and you need to create highly effective flashcards from this content.

IMPORTANT: Do NOT ask for the PDF or request additional content. Work with the text content provided below to create flashcards.

Document content to create flashcards from:
${options.content}

${focusAreasStr}

Your task is to generate 15-25 high-quality flashcards based entirely on the content provided above. Use these evidence-based principles:

1. **Variety of Question Types**: Include definition, application, comparison, and analysis questions
2. **Progressive Difficulty**: Mix basic recall with higher-order thinking
3. **Clear and Concise**: Front should be specific, back should be complete but digestible
4. **Content-Based**: All questions must be directly derived from the provided text
5. **Memory Aids**: Add mnemonics, analogies, or visual cues in answers when possible

Format your response as a JSON array with this structure:
[
  {
    "front": "Question, term, or scenario (be specific and clear, based on the content)",
    "back": "Comprehensive answer with context from the material, examples, or memory aids",
    "difficulty": "basic|intermediate|advanced",
    "category": "definition|application|analysis|comparison"
  }
]

Examples of good flashcard types based on the content:
- Definitions: "What is [term from content] and why is it important?"
- Applications: "How would you apply [concept from content] in [scenario]?"
- Comparisons: "What are the key differences between X and Y (from the content)?"
- Analysis: "Why does [phenomenon from content] occur and what are its implications?"

Create flashcards that are pedagogically sound, based entirely on the provided content, and optimized for long-term retention.
`
      break

    case "notes":
      prompt = `
You are a master note-taker and study expert who helps students create perfect study notes. I am providing you with extracted text content from a document, and you need to create comprehensive yet concise notes from this content.

IMPORTANT: Do NOT ask for the PDF or request additional content. Work with the text content provided below to create study notes.

Document content to create study notes from:
${options.content}

${focusAreasStr}

Your task is to generate 12-20 expertly crafted study notes based entirely on the content provided above. Follow these principles:

1. **Hierarchical Structure**: Organize from general to specific concepts in the content
2. **Active Voice**: Use engaging, actionable language
3. **Memory Hooks**: Include mnemonics, analogies, or visual cues based on the material
4. **Content-Based**: All notes must be directly derived from the provided text
5. **Cross-References**: Show relationships between concepts mentioned in the content

Format your response as a JSON array of objects with this structure:
[
  {
    "point": "Clear, concise statement of key information from the content",
    "category": "concept|definition|process|application|important_fact",
    "memory_aid": "Mnemonic, analogy, or memory technique based on the content (optional)",
    "context": "Why this matters or how it connects to other concepts in the material"
  }
]

Examples of excellent notes derived from content:
- Concept: "[Key concept from the material] is important because [reason from content]"
- Process: "[Process described in content] follows these steps: [steps from material]"
- Application: "[Application mentioned in content] demonstrates [principle from material]"

Create notes that are clear, memorable, and designed for effective review and retention, all based on the provided content.
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
      
      if (options.type === "flashcards") {
        // Convert enhanced flashcard format to simple format for compatibility
        const simpleFlashcards = content.map((card: any) => ({
          front: card.front || card.question || "Question",
          back: card.back || card.answer || "Answer",
          difficulty: card.difficulty || "basic",
          category: card.category || "general"
        }))
        return { flashcards: simpleFlashcards }
      } else {
        // Enhanced notes format
        const enhancedNotes = content.map((note: any) => {
          if (typeof note === 'string') {
            return note
          }
          return note.point || note.content || note.toString()
        })
        return { notes: enhancedNotes }
      }
    }
  } catch (error) {
    console.error("Error generating reviewer with Gemini:", error)
    throw new Error("Failed to generate study material")
  }
}
