// Integration service to add analytics tracking to existing components
import { studySessionTracker, trackFileUpload, trackReviewerGeneration, trackQuizStart, trackQuizEnd } from './study-session-tracker'
import { supabase } from './supabase'

// Hook for quiz components
export function useQuizAnalytics() {
  const startQuizSession = async (quizId: string, quizTitle: string) => {
    return await trackQuizStart(quizId, quizTitle)
  }

  const endQuizSession = async (score: number, timeSpent: number, answers: any) => {
    return await trackQuizEnd(score, {
      time_spent_seconds: timeSpent,
      answers: answers
    })
  }

  const trackQuestionAttempt = async (quizAttemptId: string, questionData: {
    questionId: string
    questionText: string
    userAnswer: string
    correctAnswer: string
    isCorrect: boolean
    timeSpent: number
    difficulty?: string
    subject?: string
  }) => {
    try {
      await supabase.from('question_attempts').insert({
        quiz_attempt_id: quizAttemptId,
        question_id: questionData.questionId,
        question_text: questionData.questionText,
        user_answer: questionData.userAnswer,
        correct_answer: questionData.correctAnswer,
        is_correct: questionData.isCorrect,
        time_spent_seconds: questionData.timeSpent,
        difficulty: questionData.difficulty || 'medium',
        subject: questionData.subject || 'General'
      })
    } catch (error) {
      console.error('Error tracking question attempt:', error)
    }
  }

  return {
    startQuizSession,
    endQuizSession,
    trackQuestionAttempt
  }
}

// Hook for file upload components
export function useFileAnalytics() {
  const trackUpload = async (fileId: string, fileName: string, fileType?: string) => {
    return await trackFileUpload(fileId, fileName, fileType)
  }

  const updateFileSubject = async (fileId: string, subject: string) => {
    try {
      await supabase
        .from('files')
        .update({ subject, file_type: subject.toLowerCase() })
        .eq('id', fileId)
    } catch (error) {
      console.error('Error updating file subject:', error)
    }
  }

  return {
    trackUpload,
    updateFileSubject
  }
}

// Hook for reviewer/study guide components
export function useReviewerAnalytics() {
  const trackGeneration = async (reviewerId: string, title: string) => {
    return await trackReviewerGeneration(reviewerId, title)
  }

  return {
    trackGeneration
  }
}

// Hook for general study session tracking
export function useStudyAnalytics() {
  const startGeneralStudy = async (resourceName?: string) => {
    return await studySessionTracker.startSession({
      activityType: 'study',
      resourceName: resourceName || 'General Study Session'
    })
  }

  const endCurrentSession = async () => {
    return await studySessionTracker.endSession()
  }

  const getCurrentSession = () => {
    return studySessionTracker.getCurrentSession()
  }

  const getSessionHistory = async (limit?: number) => {
    return await studySessionTracker.getSessionHistory(limit)
  }

  return {
    startGeneralStudy,
    endCurrentSession,
    getCurrentSession,
    getSessionHistory
  }
}

// Utility function to automatically detect subject from content
export function detectSubjectFromContent(content: string, fileName?: string): string {
  const text = (content + ' ' + (fileName || '')).toLowerCase()
  
  const subjects = [
    { keywords: ['math', 'mathematics', 'calculus', 'algebra', 'geometry', 'statistics', 'arithmetic'], subject: 'Mathematics' },
    { keywords: ['physics', 'chemistry', 'biology', 'science', 'lab', 'experiment'], subject: 'Science' },
    { keywords: ['history', 'social studies', 'geography', 'politics', 'government'], subject: 'Social Studies' },
    { keywords: ['english', 'literature', 'writing', 'grammar', 'essay', 'reading'], subject: 'English' },
    { keywords: ['computer', 'programming', 'code', 'software', 'technology', 'it'], subject: 'Technology' },
    { keywords: ['business', 'economics', 'finance', 'marketing', 'management'], subject: 'Business' },
    { keywords: ['psychology', 'sociology', 'philosophy', 'anthropology'], subject: 'Social Sciences' },
    { keywords: ['art', 'music', 'design', 'creative', 'drawing', 'painting'], subject: 'Arts' }
  ]

  for (const { keywords, subject } of subjects) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return subject
    }
  }

  return 'General'
}

// Function to update existing data with subjects
export async function enhanceExistingDataWithSubjects() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Update files without subjects
    const { data: files } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', user.id)
      .is('subject', null)

    if (files) {
      for (const file of files) {
        const detectedSubject = detectSubjectFromContent('', file.original_name || file.filename)
        await supabase
          .from('files')
          .update({ subject: detectedSubject })
          .eq('id', file.id)
      }
    }

    // Update quizzes without subjects based on their associated files
    const { data: quizzes } = await supabase
      .from('quizzes')
      .select('*, files(original_name, filename, subject)')
      .eq('user_id', user.id)
      .is('subject', null)

    if (quizzes) {
      for (const quiz of quizzes) {
        const subject = quiz.files?.subject || detectSubjectFromContent(quiz.title)
        await supabase
          .from('quizzes')
          .update({ subject })
          .eq('id', quiz.id)
      }
    }

    console.log('Enhanced existing data with subjects')
  } catch (error) {
    console.error('Error enhancing existing data:', error)
  }
}

// Initialize user preferences if they don't exist
export async function initializeUserPreferences() {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: existing } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      await supabase.from('user_preferences').insert({
        user_id: user.id,
        preferred_subjects: [],
        study_goals: {
          daily_minutes: 30,
          weekly_quizzes: 5,
          improvement_target: 10
        },
        difficulty_preference: 'medium',
        daily_study_target: 30,
        notification_settings: {
          study_reminders: true,
          achievement_notifications: true,
          weekly_summary: true
        }
      })
    }
  } catch (error) {
    console.error('Error initializing user preferences:', error)
  }
}