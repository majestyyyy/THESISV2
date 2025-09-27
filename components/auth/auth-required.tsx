"use client"

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/auth/auth-provider'
import { useRouter } from 'next/navigation'

interface AuthRequiredProps {
  children: React.ReactNode
  redirectTo?: string
  message?: string
}

export function AuthRequired({ children, redirectTo = '/signin', message = 'Please sign in to access this feature.' }: AuthRequiredProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      setShowMessage(true)
      const timer = setTimeout(() => {
        router.push(redirectTo)
      }, 3000)
      
      return () => clearTimeout(timer)
    }
  }, [loading, user, router, redirectTo])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    if (showMessage) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto p-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-yellow-100 rounded-full">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Authentication Required</h3>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to sign in page...</p>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return <>{children}</>
}