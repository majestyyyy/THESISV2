import { supabase } from './supabase'

export interface StudySessionData {
  activityType: 'quiz' | 'upload' | 'review' | 'generate' | 'study'
  resourceId?: string
  resourceName?: string
  durationMinutes?: number
  metadata?: Record<string, any>
}

class StudySessionTracker {
  private currentSession: {
    id: string
    startTime: Date
    activityType: string
    resourceId?: string
    resourceName?: string
  } | null = null

  async startSession(data: StudySessionData): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      // End current session if exists
      if (this.currentSession) {
        await this.endSession()
      }

      const { data: session, error } = await supabase
        .from('study_sessions')
        .insert({
          user_id: user.id,
          activity_type: data.activityType,
          resource_id: data.resourceId,
          resource_name: data.resourceName,
          duration_minutes: 0,
          started_at: new Date().toISOString(),
          metadata: data.metadata || {}
        })
        .select()
        .single()

      if (error) throw error

      this.currentSession = {
        id: session.id,
        startTime: new Date(),
        activityType: data.activityType,
        resourceId: data.resourceId,
        resourceName: data.resourceName
      }

      return session.id
    } catch (error) {
      console.error('Error starting study session:', error)
      return null
    }
  }

  async endSession(additionalData?: { score?: number; metadata?: Record<string, any> }): Promise<void> {
    if (!this.currentSession) return

    try {
      const endTime = new Date()
      const durationMinutes = Math.round((endTime.getTime() - this.currentSession.startTime.getTime()) / (1000 * 60))

      const updateData: any = {
        duration_minutes: Math.max(1, durationMinutes), // At least 1 minute
        ended_at: endTime.toISOString()
      }

      if (additionalData?.metadata) {
        updateData.metadata = additionalData.metadata
      }

      await supabase
        .from('study_sessions')
        .update(updateData)
        .eq('id', this.currentSession.id)

      // Track quiz completion in analytics if it's a quiz session
      if (this.currentSession.activityType === 'quiz' && additionalData?.score !== undefined) {
        await this.trackQuizCompletion(additionalData.score, durationMinutes)
      }

      this.currentSession = null
    } catch (error) {
      console.error('Error ending study session:', error)
    }
  }

  async trackQuizCompletion(score: number, durationMinutes: number): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from('analytics').insert({
        user_id: user.id,
        action_type: 'quiz_completed',
        resource_id: this.currentSession?.resourceId,
        metadata: {
          score,
          duration_minutes: durationMinutes,
          activity_type: this.currentSession?.activityType
        }
      })
    } catch (error) {
      console.error('Error tracking quiz completion:', error)
    }
  }

  async trackFileUpload(fileId: string, fileName: string, fileType?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Start a quick session for file upload
      const sessionId = await this.startSession({
        activityType: 'upload',
        resourceId: fileId,
        resourceName: fileName,
        metadata: { file_type: fileType }
      })

      // End immediately with 1 minute duration
      setTimeout(async () => {
        await this.endSession({
          metadata: { file_type: fileType, processing_completed: true }
        })
      }, 1000)

      // Track in analytics
      await supabase.from('analytics').insert({
        user_id: user.id,
        action_type: 'file_uploaded',
        resource_id: fileId,
        metadata: {
          filename: fileName,
          file_type: fileType
        }
      })
    } catch (error) {
      console.error('Error tracking file upload:', error)
    }
  }

  async trackReviewerGeneration(reviewerId: string, reviewerTitle: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Track in analytics
      await supabase.from('analytics').insert({
        user_id: user.id,
        action_type: 'reviewer_generated',
        resource_id: reviewerId,
        metadata: {
          title: reviewerTitle,
          type: 'study_guide'
        }
      })
    } catch (error) {
      console.error('Error tracking reviewer generation:', error)
    }
  }

  getCurrentSession() {
    return this.currentSession
  }

  async getSessionHistory(limit: number = 10): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('started_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error getting session history:', error)
      return []
    }
  }
}

// Export singleton instance
export const studySessionTracker = new StudySessionTracker()

// Utility functions for tracking specific activities
export async function trackQuizStart(quizId: string, quizTitle: string): Promise<string | null> {
  return studySessionTracker.startSession({
    activityType: 'quiz',
    resourceId: quizId,
    resourceName: quizTitle
  })
}

export async function trackQuizEnd(score: number, metadata?: Record<string, any>): Promise<void> {
  return studySessionTracker.endSession({ score, metadata })
}

export async function trackFileUpload(fileId: string, fileName: string, fileType?: string): Promise<void> {
  return studySessionTracker.trackFileUpload(fileId, fileName, fileType)
}

export async function trackReviewerGeneration(reviewerId: string, title: string): Promise<void> {
  return studySessionTracker.trackReviewerGeneration(reviewerId, title)
}

export async function trackStudyStart(resourceName?: string): Promise<string | null> {
  return studySessionTracker.startSession({
    activityType: 'study',
    resourceName: resourceName || 'General Study Session'
  })
}

export async function trackStudyEnd(): Promise<void> {
  return studySessionTracker.endSession()
}