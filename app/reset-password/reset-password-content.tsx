"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { Footer } from "@/components/layout/footer"

export default function ResetPasswordContent() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [countdown, setCountdown] = useState(3)
  
  const router = useRouter()

  // Password strength validation
  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[A-Z]/.test(password)) strength++
    if (/[a-z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']

  // Countdown effect for success state
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [success, countdown])

  useEffect(() => {
    const initializePasswordReset = async () => {
      try {
        setIsCheckingSession(true)
        console.log('Initializing password reset...')
        
        // First check if we already have a session
        const { data: { session: existingSession } } = await supabase.auth.getSession()
        
        if (existingSession) {
          console.log('Found existing session:', existingSession.user.id)
          setIsValidSession(true)
          setIsCheckingSession(false)
          return
        }

        // Check for auth tokens in URL fragment
        const fragment = window.location.hash.substring(1)
        const params = new URLSearchParams(fragment)
        
        const accessToken = params.get('access_token')
        const refreshToken = params.get('refresh_token')
        const type = params.get('type')
        
        console.log('URL params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type,
          fragment: fragment.substring(0, 50) + '...'
        })

        if (accessToken && refreshToken && type === 'recovery') {
          console.log('Setting session with recovery tokens...')
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('Session setup error:', error)
            setError(`Authentication failed: ${error.message}`)
          } else if (data.session) {
            console.log('Session established successfully for user:', data.session.user.id)
            setIsValidSession(true)
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname)
          } else {
            setError('Failed to establish session for password reset')
          }
        } else {
          setError('Invalid password reset link. Please request a new password reset.')
        }
      } catch (err) {
        console.error('Password reset initialization error:', err)
        setError('Failed to initialize password reset. Please try requesting a new reset link.')
      } finally {
        setIsCheckingSession(false)
      }
    }

    initializePasswordReset()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }

    if (passwordStrength < 3) {
      setError("Password is too weak. Please choose a stronger password.")
      return
    }

    setLoading(true)

    try {
      console.log('Attempting to update password...')
      
      const { data, error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        console.error('Password update failed:', error)
        setError(`Failed to update password: ${error.message}`)
      } else {
        console.log('Password updated successfully!')
        setSuccess(true)
        
        // Sign out to force re-authentication with new password
        await supabase.auth.signOut()
        
        // Show success state for a bit longer before redirect
        setTimeout(() => {
          router.push('/signin?message=Password updated successfully. Please sign in with your new password.')
        }, 3000)
      }
    } catch (err) {
      console.error('Unexpected error during password update:', err)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Loading state while checking session
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Verifying reset link...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if session is not valid
  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <Image src="/LOGO.png" alt="AI-GiR Logo" width={24} height={24} />
            </div>
            <CardTitle className="text-red-800">Invalid Reset Link</CardTitle>
            <CardDescription>This password reset link is invalid or has expired.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                Password reset links expire after 1 hour. Please request a new one.
              </p>
              <div className="space-y-2">
                <Link href="/forgot-password">
                  <Button className="w-full">
                    Request New Reset Link
                  </Button>
                </Link>
                <Link href="/signin">
                  <Button variant="ghost" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Image src="/LOGO.png" alt="AI-GiR Logo" width={32} height={32} />
            </div>
            <CardTitle className="text-green-800 text-xl">🎉 Password Updated Successfully!</CardTitle>
            <CardDescription className="text-green-700">Your account is now secured with your new password</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium mb-2">
                ✅ Password updated successfully
              </p>
              <p className="text-xs text-green-700">
                You have been automatically signed out for security. Please sign in with your new password.
              </p>
            </div>
            
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                {countdown > 0 ? (
                  <>Redirecting to sign-in page in <span className="font-bold text-green-600">{countdown}</span> seconds...</>
                ) : (
                  "Redirecting now..."
                )}
              </p>
              
              <div className="space-y-2">
                <Link href="/signin">
                  <Button className="w-full bg-green-600 hover:bg-green-700">
                    Continue to Sign In
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button variant="ghost" className="w-full text-green-700 hover:bg-green-50">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Main password reset form
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Image src="/LOGO.png" alt="AI-GiR Logo" width={24} height={24} />
          </div>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>Choose a strong password for your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-2 flex-1 rounded ${
                          level <= passwordStrength
                            ? strengthColors[passwordStrength - 1] || 'bg-gray-200'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className={`text-xs ${
                    passwordStrength < 3 ? 'text-red-600' : 
                    passwordStrength < 4 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    Strength: {strengthLabels[passwordStrength - 1] || 'Very Weak'}
                  </p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Password requirements:</p>
                    <ul className="list-disc list-inside space-y-0.5 ml-2">
                      <li className={password.length >= 8 ? 'text-green-600' : 'text-gray-500'}>
                        At least 8 characters
                      </li>
                      <li className={/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                        One uppercase letter
                      </li>
                      <li className={/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                        One lowercase letter
                      </li>
                      <li className={/\d/.test(password) ? 'text-green-600' : 'text-gray-500'}>
                        One number
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={8}
              />
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
              {confirmPassword && password === confirmPassword && password && (
                <p className="text-xs text-green-600">Passwords match ✓</p>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || passwordStrength < 3 || password !== confirmPassword || !password}
            >
              {loading ? "Updating Password..." : "Update Password"}
            </Button>

            <div className="text-center">
              <Link href="/signin" className="text-sm text-blue-600 hover:underline">
                Back to Sign In
              </Link>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
}
