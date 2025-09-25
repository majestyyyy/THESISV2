import { supabase, sessionManager, ensureValidSession } from '@/lib/supabase'

// Enhanced API client with seamless authentication
export class SeamlessApiClient {
  private static async withAuth<T>(
    operation: string,
    request: () => Promise<T>
  ): Promise<T> {
    try {
      // Ensure we have a valid session before making the request
      await ensureValidSession()
      
      const result = await request()
      console.log(`✅ ${operation} completed successfully`)
      return result
    } catch (error: any) {
      console.error(`❌ ${operation} failed:`, error.message)
      
      // If it's an auth error, try to refresh session once
      if (error.message?.includes('JWT') || error.message?.includes('token')) {
        console.log('🔄 Attempting session refresh for auth error')
        try {
          await sessionManager.refreshSession()
          // Retry the request once
          return await request()
        } catch (refreshError) {
          console.error('❌ Session refresh failed, signing out user')
          await sessionManager.signOut()
          throw new Error('Session expired. Please sign in again.')
        }
      }
      
      throw error
    }
  }

  // File operations
  static async getFiles() {
    return this.withAuth('Get Files', async () => {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .order('upload_date', { ascending: false })
      
      if (error) throw error
      return data
    })
  }

  static async uploadFile(fileData: any) {
    return this.withAuth('Upload File', async () => {
      const { data, error } = await supabase
        .from('files')
        .insert(fileData)
        .select()
        .single()
      
      if (error) throw error
      return data
    })
  }

  static async deleteFile(fileId: string) {
    return this.withAuth('Delete File', async () => {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)
      
      if (error) throw error
      return true
    })
  }

  // Quiz operations
  static async getQuizzes() {
    return this.withAuth('Get Quizzes', async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          files (
            original_name,
            filename
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    })
  }

  static async createQuiz(quizData: any) {
    return this.withAuth('Create Quiz', async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .insert(quizData)
        .select()
        .single()
      
      if (error) throw error
      return data
    })
  }

  static async getQuiz(quizId: string) {
    return this.withAuth('Get Quiz', async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          *,
          files (
            original_name,
            filename,
            content_text
          )
        `)
        .eq('id', quizId)
        .single()
      
      if (error) throw error
      return data
    })
  }

  // Quiz session operations
  static async createQuizSession(sessionData: any) {
    return this.withAuth('Create Quiz Session', async () => {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .insert(sessionData)
        .select()
        .single()
      
      if (error) throw error
      return data
    })
  }

  static async updateQuizSession(sessionId: string, updates: any) {
    return this.withAuth('Update Quiz Session', async () => {
      const { data, error } = await supabase
        .from('quiz_sessions')
        .update(updates)
        .eq('id', sessionId)
        .select()
        .single()
      
      if (error) throw error
      return data
    })
  }

  static async getQuizSessions(quizId?: string) {
    return this.withAuth('Get Quiz Sessions', async () => {
      let query = supabase
        .from('quiz_sessions')
        .select(`
          *,
          quizzes (
            title,
            total_questions
          )
        `)
        .order('started_at', { ascending: false })

      if (quizId) {
        query = query.eq('quiz_id', quizId)
      }

      const { data, error } = await query
      
      if (error) throw error
      return data
    })
  }

  // Reviewer operations
  static async getReviewers() {
    return this.withAuth('Get Reviewers', async () => {
      const { data, error } = await supabase
        .from('reviewers')
        .select(`
          *,
          files (
            original_name,
            filename
          )
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    })
  }

  static async createReviewer(reviewerData: any) {
    return this.withAuth('Create Reviewer', async () => {
      const { data, error } = await supabase
        .from('reviewers')
        .insert(reviewerData)
        .select()
        .single()
      
      if (error) throw error
      return data
    })
  }

  static async getReviewer(reviewerId: string) {
    return this.withAuth('Get Reviewer', async () => {
      const { data, error } = await supabase
        .from('reviewers')
        .select(`
          *,
          files (
            original_name,
            filename,
            content_text
          )
        `)
        .eq('id', reviewerId)
        .single()
      
      if (error) throw error
      return data
    })
  }

  // Analytics operations
  static async trackAnalytics(analyticsData: any) {
    return this.withAuth('Track Analytics', async () => {
      const { data, error } = await supabase
        .from('user_analytics')
        .insert(analyticsData)
        .select()
        .single()
      
      if (error) throw error
      return data
    })
  }

  static async getAnalytics(timeframe?: string) {
    return this.withAuth('Get Analytics', async () => {
      let query = supabase
        .from('user_analytics')
        .select('*')
        .order('timestamp', { ascending: false })

      if (timeframe) {
        const now = new Date()
        let startDate = new Date()
        
        switch (timeframe) {
          case 'day':
            startDate.setDate(now.getDate() - 1)
            break
          case 'week':
            startDate.setDate(now.getDate() - 7)
            break
          case 'month':
            startDate.setMonth(now.getMonth() - 1)
            break
        }
        
        query = query.gte('timestamp', startDate.toISOString())
      }

      const { data, error } = await query
      
      if (error) throw error
      return data
    })
  }

  // Realtime subscriptions with automatic reconnection
  static subscribeToTable(table: string, callback: (payload: any) => void) {
    console.log(`🔗 Setting up realtime subscription for ${table}`)
    
    const channel = supabase
      .channel(`${table}_changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table,
        },
        (payload) => {
          console.log(`📡 Realtime update for ${table}:`, payload.eventType)
          callback(payload)
        }
      )
      .subscribe((status) => {
        console.log(`📡 Subscription status for ${table}:`, status)
      })

    return () => {
      console.log(`🔗 Unsubscribing from ${table}`)
      supabase.removeChannel(channel)
    }
  }
}

// Export singleton instance
export const api = SeamlessApiClient