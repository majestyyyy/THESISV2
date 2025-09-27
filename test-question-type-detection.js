// Test script to verify question type detection
import { detectQuestionType } from './lib/quiz-session.js'

console.log('🧪 Testing Question Type Detection\n')

// Test cases
const testQuestions = [
  {
    name: "True/False with explicit type",
    question: {
      questionType: "true_false",
      options: ["True", "False"],
      correctAnswer: "True",
      questionText: "The sky is blue."
    }
  },
  {
    name: "True/False without explicit type (case 1)",
    question: {
      options: ["True", "False"],
      correctAnswer: "True",
      questionText: "The sky is blue."
    }
  },
  {
    name: "True/False without explicit type (case 2)",
    question: {
      options: ["true", "false"],
      correctAnswer: "False",
      questionText: "The sky is green."
    }
  },
  {
    name: "Multiple Choice question",
    question: {
      options: ["A", "B", "C", "D"],
      correctAnswer: "A",
      questionText: "What is 2+2?"
    }
  },
  {
    name: "Identification question",
    question: {
      correctAnswer: "Photosynthesis",
      questionText: "What is the process by which plants make food?"
    }
  }
]

testQuestions.forEach(test => {
  const detected = detectQuestionType(test.question)
  console.log(`✅ ${test.name}: ${detected}`)
  console.log(`   Options: ${JSON.stringify(test.question.options || 'none')}`)
  console.log(`   Correct Answer: ${test.question.correctAnswer}`)
  console.log()
})

console.log('🎯 Test completed! Check the results above.')