"use client"

import type React from "react"

import { useAuth } from "./auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireEmailConfirmed?: boolean
}

export function ProtectedRoute({ children, requireEmailConfirmed = true }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/signin")
        return
      }

      if (requireEmailConfirmed && !user.emailConfirmed) {
        router.push("/confirm-email")
        return
      }
    }
  }, [user, loading, router, requireEmailConfirmed])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user || (requireEmailConfirmed && !user.emailConfirmed)) {
    return null
  }

  return <>{children}</>
}
