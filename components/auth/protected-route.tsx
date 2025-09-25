"use client"

import type React from "react"
import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireEmailConfirmed?: boolean
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  requireEmailConfirmed = false, // Changed default to false for more flexibility
  fallback 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, error } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (loading) return // Wait for auth to load

    if (!isAuthenticated) {
      console.log('🚪 User not authenticated, redirecting to signin')
      setIsRedirecting(true)
      router.push("/signin")
      return
    }

    if (requireEmailConfirmed && user && !user.email_confirmed_at) {
      console.log('📧 Email not confirmed, redirecting to confirmation')
      setIsRedirecting(true)
      router.push("/confirm-email")
      return
    }

    // User is properly authenticated
    setIsRedirecting(false)
  }, [user, loading, isAuthenticated, router, requireEmailConfirmed])

  // Show loading state
  if (loading || isRedirecting) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
          <div className="text-sm text-muted-foreground">
            {loading ? 'Loading session...' : 'Redirecting...'}
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-2">Session Error</div>
          <div className="text-sm text-muted-foreground">{error}</div>
        </div>
      </div>
    )
  }

  // Don't render if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  // Don't render if email confirmation required but not confirmed
  if (requireEmailConfirmed && user && !user.email_confirmed_at) {
    return null
  }

  return <>{children}</>
}
