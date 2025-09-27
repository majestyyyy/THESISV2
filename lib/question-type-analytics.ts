import { supabase } from './supabase'

// Interface for individual question type performance in a single quiz
export interface QuizQuestionTypePerformance {
  quiz_id: string
  user_id: string
  question_type: string
  correct_answers: number
  total_questions: number
  percentage: number
  quiz_date: string
}

// Interface for cumulative question type performance across all quizzes
export interface CumulativeQuestionTypePerformance {
  user_id: string
  question_type: string
  total_correct: number
  total_questions: number
  total_percentage: number
  quiz_count: number // Number of quizzes with this question type
  last_updated: string
}

// Interface for detailed question type analytics
export interface QuestionTypeAnalytics {
  user_id: string
  cumulative_performance: CumulativeQuestionTypePerformance[]
  recent_performance: QuizQuestionTypePerformance[]
  improvement_trends: {
    question_type: string
    trend: 'improving' | 'declining' | 'stable'
    change_percentage: number
  }[]
}

// Save question type performance for a specific quiz
export async function saveQuizQuestionTypePerformance(
  userId: string,
  quizId: string,
  questionTypeAnalysis: Record<string, { correct: number; total: number; percentage: number }>
): Promise<void> {
  try {
    console.log('💾 Saving question type performance...', { userId, quizId })

    // Prepare data for insertion
    const performanceData = Object.entries(questionTypeAnalysis)
      .filter(([_, stats]) => stats.total > 0) // Only save question types that were actually answered
      .map(([questionType, stats]) => ({
        user_id: userId,
        quiz_id: quizId,
        question_type: questionType,
        correct_answers: stats.correct,
        total_questions: stats.total,
        percentage: stats.percentage,
        quiz_date: new Date().toISOString()
      }))

    if (performanceData.length === 0) {
      console.log('No question type data to save')
      return
    }

    // Insert performance data
    const { error: insertError } = await supabase
      .from('quiz_question_type_performance')
      .insert(performanceData)

    if (insertError) {
      console.error('❌ Error saving question type performance:', insertError)
      throw insertError
    }

    // Update cumulative performance
    await updateCumulativePerformance(userId, questionTypeAnalysis)

    console.log('✅ Question type performance saved successfully')
  } catch (error) {
    console.error('❌ Failed to save question type performance:', error)
    throw error
  }
}

// Update cumulative performance across all quizzes
async function updateCumulativePerformance(
  userId: string,
  questionTypeAnalysis: Record<string, { correct: number; total: number; percentage: number }>
): Promise<void> {
  try {
    for (const [questionType, stats] of Object.entries(questionTypeAnalysis)) {
      if (stats.total === 0) continue

      // Get existing cumulative data
      const { data: existingData, error: fetchError } = await supabase
        .from('cumulative_question_type_performance')
        .select('*')
        .eq('user_id', userId)
        .eq('question_type', questionType)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError
      }

      if (existingData) {
        // Update existing record
        const newTotalCorrect = existingData.total_correct + stats.correct
        const newTotalQuestions = existingData.total_questions + stats.total
        const newPercentage = Math.round((newTotalCorrect / newTotalQuestions) * 100)
        const newQuizCount = existingData.quiz_count + 1

        const { error: updateError } = await supabase
          .from('cumulative_question_type_performance')
          .update({
            total_correct: newTotalCorrect,
            total_questions: newTotalQuestions,
            total_percentage: newPercentage,
            quiz_count: newQuizCount,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', userId)
          .eq('question_type', questionType)

        if (updateError) {
          throw updateError
        }
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('cumulative_question_type_performance')
          .insert({
            user_id: userId,
            question_type: questionType,
            total_correct: stats.correct,
            total_questions: stats.total,
            total_percentage: stats.percentage,
            quiz_count: 1,
            last_updated: new Date().toISOString()
          })

        if (insertError) {
          throw insertError
        }
      }
    }
  } catch (error) {
    console.error('❌ Error updating cumulative performance:', error)
    throw error
  }
}

// Get cumulative performance for all question types for a user
export async function getCumulativeQuestionTypePerformance(
  userId: string
): Promise<CumulativeQuestionTypePerformance[]> {
  try {
    const { data, error } = await supabase
      .from('cumulative_question_type_performance')
      .select('*')
      .eq('user_id', userId)
      .order('total_percentage', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('❌ Error fetching cumulative performance:', error)
    throw error
  }
}

// Get recent quiz performance by question type (last 10 quizzes)
export async function getRecentQuestionTypePerformance(
  userId: string,
  limit: number = 10
): Promise<QuizQuestionTypePerformance[]> {
  try {
    const { data, error } = await supabase
      .from('quiz_question_type_performance')
      .select('*')
      .eq('user_id', userId)
      .order('quiz_date', { ascending: false })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('❌ Error fetching recent performance:', error)
    throw error
  }
}

// Calculate improvement trends for question types
export async function calculateImprovementTrends(
  userId: string
): Promise<{ question_type: string; trend: 'improving' | 'declining' | 'stable'; change_percentage: number }[]> {
  try {
    const recentPerformance = await getRecentQuestionTypePerformance(userId, 20)
    
    // Group by question type
    const performanceByType: Record<string, QuizQuestionTypePerformance[]> = {}
    recentPerformance.forEach(perf => {
      if (!performanceByType[perf.question_type]) {
        performanceByType[perf.question_type] = []
      }
      performanceByType[perf.question_type].push(perf)
    })

    const trends = []

    for (const [questionType, performances] of Object.entries(performanceByType)) {
      if (performances.length < 3) continue // Need at least 3 data points for trend analysis

      // Sort by date (most recent first)
      performances.sort((a, b) => new Date(b.quiz_date).getTime() - new Date(a.quiz_date).getTime())

      // Compare recent performance (last 3) with earlier performance (next 3)
      const recentAvg = performances.slice(0, 3).reduce((sum, p) => sum + p.percentage, 0) / 3
      const earlierAvg = performances.slice(3, 6).reduce((sum, p) => sum + p.percentage, 0) / Math.min(3, performances.length - 3)

      const changePercentage = recentAvg - earlierAvg
      let trend: 'improving' | 'declining' | 'stable'

      if (changePercentage > 5) {
        trend = 'improving'
      } else if (changePercentage < -5) {
        trend = 'declining'
      } else {
        trend = 'stable'
      }

      trends.push({
        question_type: questionType,
        trend,
        change_percentage: Math.round(changePercentage * 100) / 100
      })
    }

    return trends
  } catch (error) {
    console.error('❌ Error calculating improvement trends:', error)
    return []
  }
}

// Get comprehensive question type analytics
export async function getQuestionTypeAnalytics(userId: string): Promise<QuestionTypeAnalytics> {
  try {
    const [cumulativePerformance, recentPerformance, improvementTrends] = await Promise.all([
      getCumulativeQuestionTypePerformance(userId),
      getRecentQuestionTypePerformance(userId),
      calculateImprovementTrends(userId)
    ])

    return {
      user_id: userId,
      cumulative_performance: cumulativePerformance,
      recent_performance: recentPerformance,
      improvement_trends: improvementTrends
    }
  } catch (error) {
    console.error('❌ Error getting question type analytics:', error)
    throw error
  }
}

// Get performance summary for display
export function getPerformanceSummary(
  cumulativePerformance: CumulativeQuestionTypePerformance[]
): string {
  if (cumulativePerformance.length === 0) {
    return "No quiz data available yet. Take some quizzes to see your performance!"
  }

  const totalQuestions = cumulativePerformance.reduce((sum, perf) => sum + perf.total_questions, 0)
  const totalCorrect = cumulativePerformance.reduce((sum, perf) => sum + perf.total_correct, 0)
  const overallPercentage = Math.round((totalCorrect / totalQuestions) * 100)

  let summary = `Overall Performance: ${overallPercentage}% (${totalCorrect}/${totalQuestions} questions)\n\n`
  
  // Sort by performance
  const sortedPerformance = [...cumulativePerformance].sort((a, b) => b.total_percentage - a.total_percentage)
  
  summary += "Performance by Question Type:\n"
  sortedPerformance.forEach(perf => {
    const questionTypeDisplay = getQuestionTypeDisplayName(perf.question_type)
    summary += `• ${questionTypeDisplay}: ${perf.total_percentage}% (${perf.total_correct}/${perf.total_questions}) across ${perf.quiz_count} quizzes\n`
  })

  return summary
}

// Helper function to get display name for question types
function getQuestionTypeDisplayName(questionType: string): string {
  const displayNames: Record<string, string> = {
    multiple_choice: "Multiple Choice",
    true_false: "True/False",
    identification: "Identification",
    fill_in_blanks: "Fill in the Blanks",
    flashcard: "Flashcard",
    mixed: "Mixed",
    unknown: "Unknown"
  }
  
  return displayNames[questionType] || questionType
}