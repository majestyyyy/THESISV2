"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, Mail, CheckCircle } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"

export default function ConfirmEmailPage() {
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState("")
  const { user } = useAuth()

  const handleResendEmail = async () => {
    setResending(true)
    // Placeholder implementation
    setTimeout(() => {
      setMessage("Confirmation email has been resent!")
      setResending(false)
    }, 1000)
  }

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

  if (user.emailConfirmed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <CardTitle>Email Confirmed!</CardTitle>
            <CardDescription>Your email has been successfully verified.</CardDescription>
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
        <CardContent className="text-center space-y-4">
          {message && (
            <Alert>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-gray-600">
            Click the link in your email to confirm your account and start using AI-GIR.
          </p>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full bg-transparent"
              onClick={handleResendEmail}
              disabled={resending}
            >
              {resending ? "Resending..." : "Resend Confirmation Email"}
            </Button>

            <Link href="/signin">
              <Button variant="ghost" className="w-full">
                Back to Sign In
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
