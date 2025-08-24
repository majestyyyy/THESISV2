"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Mail, CheckCircle, AlertCircle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"

export default function ConfirmEmailPage() {
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Check for confirmation tokens in URL (from email link)
    const token = searchParams.get('token')
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (tokenHash && type === 'email') {
      handleEmailConfirmation(tokenHash)
    } else if (token) {
      handleEmailConfirmation(token)
    }
  }, [searchParams])

  const handleEmailConfirmation = async (token: string) => {
    setConfirming(true)
    setError("")

    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      })

      if (error) {
        setError("Invalid or expired confirmation link. Please request a new one.")
      } else {
        setConfirmed(true)
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push("/dashboard")
        }, 3000)
      }
    } catch (error) {
      setError("An error occurred while confirming your email.")
    }

    setConfirming(false)
  }

  const handleResendEmail = async () => {
    if (!user?.email) {
      setError("No email address found. Please sign up again.")
      return
    }

    setResending(true)
    setError("")
    setMessage("")

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage("Confirmation email has been resent! Please check your inbox.")
      }
    } catch (error) {
      setError("Failed to resend confirmation email. Please try again.")
    }

    setResending(false)
  }

  // Show confirmation success
  if (confirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle>Email Confirmed!</CardTitle>
            <CardDescription>
              Your email has been successfully verified. You're being redirected to your dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show confirming state
  if (confirming) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Confirming your email...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Redirect to sign-in if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <p>Please sign in to access this page.</p>
            <Link href="/signin">
              <Button className="mt-4">Sign In</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if user already confirmed (only show this if they're not just coming from signup)
  if (user?.emailConfirmed && !searchParams.get('from-signup')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle>Email Already Confirmed!</CardTitle>
            <CardDescription>Your email has been verified. You can access all features.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show email confirmation prompt
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold">AI-GIR</h1>
          </div>
          <Mail className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We've sent a confirmation link to <strong>{user.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {message && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Click the confirmation link in your email to verify your account and access all features.
            </p>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">Didn't receive the email?</p>
              <Button 
                variant="outline" 
                onClick={handleResendEmail} 
                disabled={resending}
                className="w-full"
              >
                {resending ? "Sending..." : "Resend Confirmation Email"}
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500 mb-2">
                Wrong email address?
              </p>
              <Link href="/signup">
                <Button variant="ghost" className="text-sm">
                  Sign up with different email
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
