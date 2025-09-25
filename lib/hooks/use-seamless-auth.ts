"use client"

import { useEffect, useState, useCallback, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { sessionManager } from '@/lib/supabase'

interface UseSeamlessAuthReturn {
  user: User | null
  session: Session | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  timeUntilExpiry: number
  signOut: () => Promise<void>
  refreshSession: () => Promise<void>
  setUser: (user: User | null) => void
}

export function useSeamlessAuth(): UseSeamlessAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeUntilExpiry, setTimeUntilExpiry] = useState(0)
  const initializationRef = useRef(false)

  const updateTimeUntilExpiry = useCallback(() => {
    if (session) {
      const time = sessionManager.getTimeUntilExpiry(session)
      setTimeUntilExpiry(time)
    } else {
      setTimeUntilExpiry(0)
    }
  }, [session])

  const handleSessionUpdate = useCallback((newSession: Session | null) => {
    console.log('🔄 Seamless session update:', newSession?.user?.id || 'signed out')
    setSession(newSession)
    setUser(newSession?.user ?? null)
    setError(null)
    
    // Show success message for token refresh
    if (newSession && session && newSession.access_token !== session.access_token) {
      console.log('✅ Session refreshed seamlessly - continuing without interruption')
    }
  }, [session])

  const refreshSession = useCallback(async () => {
    try {
      setError(null)
      console.log('🔄 Manual session refresh requested')
      const { session: newSession, error: refreshError } = await sessionManager.refreshSession()
      
      if (refreshError) {
        setError(refreshError.message || 'Failed to refresh session')
        console.error('❌ Session refresh failed:', refreshError)
      } else {
        console.log('✅ Manual session refresh successful')
      }
    } catch (err) {
      setError('Session refresh failed')
      console.error('❌ Session refresh error:', err)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      console.log('🚪 Signing out user')
      await sessionManager.signOut()
      setUser(null)
      setSession(null)
      setError(null)
      setTimeUntilExpiry(0)
    } catch (err) {
      console.error('❌ Sign out error:', err)
      setError('Failed to sign out')
    }
  }, [])

  // Initialize session on mount
  useEffect(() => {
    if (initializationRef.current) return
    initializationRef.current = true

    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing seamless auth')
        const { session: currentSession } = await sessionManager.getSession()
        
        if (mounted) {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
          setLoading(false)
          console.log('✅ Initial auth state loaded:', currentSession?.user?.id || 'no user')
        }
      } catch (err) {
        console.error('❌ Auth initialization failed:', err)
        if (mounted) {
          setError('Failed to initialize authentication')
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  // Listen for seamless session updates
  useEffect(() => {
    const unsubscribe = sessionManager.onSessionChange(handleSessionUpdate)
    return unsubscribe
  }, [handleSessionUpdate])

  // Update expiry timer every 30 seconds
  useEffect(() => {
    updateTimeUntilExpiry()
    
    const interval = setInterval(updateTimeUntilExpiry, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [updateTimeUntilExpiry])

  // Listen to auth state changes for additional logging
  useEffect(() => {
    const { data: { subscription } } = sessionManager.onAuthStateChange(
      (event, newSession) => {
        switch (event) {
          case 'SIGNED_IN':
            console.log('✅ User signed in seamlessly')
            break
          case 'SIGNED_OUT':
            console.log('👋 User signed out')
            break
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token refreshed in background - no action needed')
            break
          case 'USER_UPDATED':
            console.log('👤 User profile updated')
            break
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  return {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    timeUntilExpiry,
    signOut,
    refreshSession,
    setUser
  }
}