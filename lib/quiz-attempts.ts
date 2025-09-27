import { supabase } from './supabase'

export interface QuizAttemptData {
  user_id: string
  quiz_id: string
  score: number
  total_questions: number
  time_taken: number // in seconds
  answers: Record<string, any> // User's answers
}

export async function saveQuizAttempt(attemptData: QuizAttemptData) {
  try {
    console.log('💾 Saving quiz attempt to database...', {
      user_id: attemptData.user_id,
      quiz_id: attemptData.quiz_id,
      score: attemptData.score
    })

    const { data, error } = await supabase
      .from('quiz_attempts')
      .insert([{
        user_id: attemptData.user_id,
        quiz_id: attemptData.quiz_id,
        score: attemptData.score,
        total_questions: attemptData.total_questions,
        time_taken: attemptData.time_taken,
        answers: attemptData.answers,
        completed_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Database error saving quiz attempt:', error)
      if (error.code === 'PGRST116') {
        throw new Error('Database connection failed. Please check your internet connection and try again.')
      } else if (error.message.includes('auth')) {
        throw new Error('Authentication required. Please sign in to save your quiz results.')
      } else {
        throw new Error(`Failed to save quiz attempt: ${error.message}`)
      }
    }

    console.log('✅ Quiz attempt saved successfully to database:', data.id)
    return data
  } catch (error) {
    console.error('❌ Failed to save quiz attempt:', error)
    
    // Re-throw with user-friendly message if it's our custom error
    if (error instanceof Error && (error.message.includes('Database connection') || error.message.includes('Authentication required'))) {
      throw error
    }
    
    // Otherwise, throw a generic error
    throw new Error('Unable to save quiz results. Please ensure you are signed in and try again.')
  }
}

export async function getQuizAttempts(userId: string, quizId?: string) {
  try {
    let query = supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })

    if (quizId) {
      query = query.eq('quiz_id', quizId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching quiz attempts:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch quiz attempts:', error)
    throw error
  }
}

export async function hasUserTakenQuiz(userId: string, quizId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('id')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .limit(1)

    if (error) {
      console.error('Error checking quiz attempts:', error)
      return false
    }

    return (data && data.length > 0) || false
  } catch (error) {
    console.error('Failed to check quiz attempts:', error)
    return false
  }
}

export async function getBestQuizAttempt(userId: string, quizId: string) {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('user_id', userId)
      .eq('quiz_id', quizId)
      .order('score', { ascending: false })
      .limit(1)

    if (error) {
      console.error('Error fetching best quiz attempt:', error)
      throw error
    }

    return data && data.length > 0 ? data[0] : null
  } catch (error) {
    console.error('Failed to fetch best quiz attempt:', error)
    return null
  }
}