import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-auth-token',
    debug: process.env.NODE_ENV === 'development',
  },
  global: {
    headers: {
      'x-client-info': 'supabase-js-web',
    },
  },
})

// Enhanced session manager with proactive token refresh
export class SessionManager {
  private refreshTimer: NodeJS.Timeout | null = null
  private isRefreshing = false
  private refreshPromise: Promise<any> | null = null
  private sessionCallbacks: ((session: any) => void)[] = []
  private healthCheckInterval: NodeJS.Timeout | null = null

  constructor() {
    // Initialize session monitoring when class is instantiated
    this.initializeSessionMonitoring()
    // Start health check every 30 seconds
    this.startHealthCheck()
  }

  private async initializeSessionMonitoring() {
    // Get initial session and set up refresh timer
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      this.scheduleTokenRefresh(session)
      this.notifySessionCallbacks(session)
    }

    // Listen for auth state changes to update refresh timer
    supabase.auth.onAuthStateChange((event, session) => {
      console.log(`Auth event: ${event}`, session?.user?.id ? `User: ${session.user.id}` : 'No user')
      
      if (event === 'SIGNED_IN' && session) {
        this.scheduleTokenRefresh(session)
        this.notifySessionCallbacks(session)
      } else if (event === 'SIGNED_OUT') {
        this.clearRefreshTimer()
        this.stopHealthCheck()
        this.notifySessionCallbacks(null)
      } else if (event === 'TOKEN_REFRESHED' && session) {
        this.scheduleTokenRefresh(session)
        this.notifySessionCallbacks(session)
        console.log('✅ Token refreshed seamlessly - no page refresh needed')
      }
    })
  }

  private startHealthCheck() {
    // Check session health every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      if (typeof window === 'undefined') return // Skip on server
      
      try {
        const { session } = await this.getSession()
        if (session && this.sessionNeedsRefresh(session)) {
          console.log('🔄 Proactive session refresh triggered by health check')
          await this.refreshToken()
        }
      } catch (error) {
        console.error('Health check failed:', error)
      }
    }, 30000) // 30 seconds
  }

  private stopHealthCheck() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }

  private notifySessionCallbacks(session: any) {
    this.sessionCallbacks.forEach(callback => {
      try {
        callback(session)
      } catch (error) {
        console.error('Session callback error:', error)
      }
    })
  }

  private scheduleTokenRefresh(session: any) {
    // Clear existing timer
    this.clearRefreshTimer()

    if (!session?.expires_at) return

    const expiresAt = session.expires_at * 1000 // Convert to milliseconds
    const now = Date.now()
    const timeUntilExpiry = expiresAt - now

    // Refresh token 1 minute before expiration (or immediately if already expired)
    const refreshTime = Math.max(timeUntilExpiry - (1 * 60 * 1000), 0)

    const refreshTimeMinutes = Math.round(refreshTime / 1000 / 60)
    console.log(`Scheduling token refresh in ${refreshTimeMinutes} minute${refreshTimeMinutes !== 1 ? 's' : ''}`)

    this.refreshTimer = setTimeout(() => {
      this.refreshToken()
    }, refreshTime)
  }

  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  private async refreshToken() {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise
    }

    this.isRefreshing = true
    this.refreshPromise = this.performTokenRefresh()

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      this.isRefreshing = false
      this.refreshPromise = null
    }
  }

  private async performTokenRefresh() {
    try {
      console.log('Refreshing authentication token...')
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Token refresh failed:', error)
        // If refresh fails, sign out user
        await this.signOut()
        return { session: null, error }
      }

      console.log('Token refreshed successfully')
      return { session: data.session, error: null }
    } catch (error) {
      console.error('Token refresh error:', error)
      await this.signOut()
      return { session: null, error }
    }
  }

  // Public methods
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }

  async refreshSession() {
    return await this.refreshToken()
  }

  async signOut() {
    this.clearRefreshTimer()
    this.stopHealthCheck()
    const { error } = await supabase.auth.signOut()
    
    if (!error && typeof window !== 'undefined') {
      // Clear additional storage items if needed
      localStorage.removeItem('user-preferences')
      sessionStorage.clear()
    }
    
    return { error }
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }

  // Subscribe to session changes for seamless UI updates
  onSessionChange(callback: (session: any) => void) {
    this.sessionCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.sessionCallbacks.indexOf(callback)
      if (index > -1) {
        this.sessionCallbacks.splice(index, 1)
      }
    }
  }

  // Check if session needs refresh (within 2 minutes of expiry)
  sessionNeedsRefresh(session: any): boolean {
    if (!session?.expires_at) return false
    
    const expiresAt = session.expires_at * 1000
    const now = Date.now()
    const timeUntilExpiry = expiresAt - now
    
    return timeUntilExpiry < (2 * 60 * 1000) // Less than 2 minutes
  }

  // Get time until token expires (in minutes)
  getTimeUntilExpiry(session: any): number {
    if (!session?.expires_at) return 0
    
    const expiresAt = session.expires_at * 1000
    const now = Date.now()
    const timeUntilExpiry = expiresAt - now
    
    return Math.max(Math.round(timeUntilExpiry / 1000 / 60), 0)
  }
}

// Create singleton instance
export const sessionManager = new SessionManager()

// Utility function for components to check and refresh session if needed
export const ensureValidSession = async () => {
  const { session } = await sessionManager.getSession()
  
  if (!session) {
    throw new Error('No active session')
  }

  if (sessionManager.sessionNeedsRefresh(session)) {
    console.log('Session needs refresh, refreshing now...')
    const { session: newSession, error } = await sessionManager.refreshSession()
    
    if (error) {
      throw new Error('Failed to refresh session')
    }
    
    return newSession
  }

  return session
}

// Database types

export interface Database {
  
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          email_confirmed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          email: string
          first_name: string
          last_name: string
          email_confirmed?: boolean
        }
        Update: {
          email?: string
          first_name?: string
          last_name?: string
          email_confirmed?: boolean
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          user_id: string
          filename: string
          original_name: string
          file_type: string
          file_size: number
          content_text: string | null
          upload_date: string
        }
        Insert: {
          user_id: string
          filename: string
          original_name: string
          file_type: string
          file_size: number
          content_text?: string | null
        }
        Update: {
          filename?: string
          original_name?: string
          file_type?: string
          file_size?: number
          content_text?: string | null
        }
      }
      quizzes: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          file_id: string
          questions: any // JSON array
          total_questions: number
          created_at: string
        }
        Insert: {
          user_id: string
          title: string
          description?: string | null
          file_id: string
          questions: any
          total_questions: number
        }
        Update: {
          title?: string
          description?: string | null
          questions?: any
          total_questions?: number
        }
      }
      quiz_sessions: {
        Row: {
          id: string
          quiz_id: string
          user_id: string
          answers: any // JSON object
          score: number | null
          total_questions: number
          started_at: string
          completed_at: string | null
        }
        Insert: {
          quiz_id: string
          user_id: string
          answers?: any
          total_questions: number
        }
        Update: {
          answers?: any
          score?: number | null
          completed_at?: string | null
        }
      }
      reviewers: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          file_id: string
          content: any // JSON object
          created_at: string
        }
        Insert: {
          user_id: string
          title: string
          description?: string | null
          file_id: string
          content: any
        }
        Update: {
          title?: string
          description?: string | null
          content?: any
        }
      }
      user_analytics: {
        Row: {
          id: string
          user_id: string
          quiz_id: string | null
          action_type: string
          metadata: any | null
          timestamp: string
        }
        Insert: {
          user_id: string
          quiz_id?: string | null
          action_type: string
          metadata?: any | null
        }
        Update: {
          metadata?: any | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
