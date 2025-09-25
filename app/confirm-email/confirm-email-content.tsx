"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/components/auth/auth-provider"
import { supabase } from "@/lib/supabase"

export default function ConfirmEmailContent() {
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
    }

    // If user is already logged in and email is confirmed, redirect
    if (user && user.email_confirmed_at) {
      router.push('/dashboard')
    }
  }, [searchParams, user, router])

  const handleEmailConfirmation = async (tokenHash: string) => {
    setConfirming(true)
    setError("")

    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'email'
      })

      if (error) {
        setError(error.message)
      } else {
        setConfirmed(true)
        setMessage("Email confirmed successfully! You will be redirected to the dashboard shortly.")
        
        // Redirect after confirmation
        setTimeout(() => {
          router.push('/dashboard')
        }, 2000)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setConfirming(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!user?.email) {
      setError("No email found. Please try signing up again.")
      return
    }

    setResending(true)
    setError("")
    setMessage("")

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage("Confirmation email sent! Please check your inbox.")
      }
    } catch (err) {
      setError("Failed to resend confirmation email. Please try again.")
    } finally {
      setResending(false)
    }
  }

  if (confirming) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Image src="/LOGO.png" alt="AI-GiR Logo" width={24} height={24} />
            </div>
            <CardTitle>Confirming Email...</CardTitle>
            <CardDescription>Please wait while we confirm your email address.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>Email Confirmed!</CardTitle>
            <CardDescription>Your email has been successfully confirmed.</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              You will be redirected to the dashboard shortly.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-blue-600" />
          </div>
          <CardTitle>Confirm Your Email</CardTitle>
          <CardDescription>
            We've sent a confirmation email to {user?.email || 'your email address'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {message && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              Please check your email and click the confirmation link to activate your account.
            </p>

            <div className="space-y-2">
              <Button
                onClick={handleResendConfirmation}
                disabled={resending}
                variant="outline"
                className="w-full"
              >
                {resending ? "Sending..." : "Resend Confirmation Email"}
              </Button>

              <div className="text-center">
                <Link href="/signin" className="text-sm text-blue-600 hover:underline">
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>Didn't receive the email?</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Check your spam/junk folder</li>
                <li>Make sure you entered the correct email address</li>
                <li>Try resending the confirmation email</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
