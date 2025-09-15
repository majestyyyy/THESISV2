"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import { resetPassword } from "@/lib/auth"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Check for cooldown on mount
  useEffect(() => {
    const lastResetTime = localStorage.getItem('lastPasswordReset')
    if (lastResetTime) {
      const timeDiff = Date.now() - parseInt(lastResetTime)
      const remainingCooldown = Math.max(0, 60000 - timeDiff) // 1 minute cooldown
      if (remainingCooldown > 0) {
        setCooldown(Math.ceil(remainingCooldown / 1000))
      }
    }
  }, [])

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (cooldown > 0) {
      setError(`Please wait ${cooldown} seconds before requesting another reset`)
      return
    }

    setLoading(true)
    setError("")
    setMessage("")

    const result = await resetPassword(email)

    if (result.error) {
      setError(result.error)
    } else {
      setMessage("Password reset instructions have been sent to your email address.")
      setEmailSent(true)
      // Set cooldown
      localStorage.setItem('lastPasswordReset', Date.now().toString())
      setCooldown(60) // 1 minute cooldown
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 flex items-center justify-center">
              <Image
                src="/LOGO.png"
                alt="AI-GiR Logo"
                width={32}
                height={32}
                className="w-8 h-8 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold">AI-GiR</h1>
          </div>
          <CardTitle>Reset Your Password</CardTitle>
          <CardDescription>Enter your email address and we'll send you reset instructions</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {message && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {message}
                  {emailSent && (
                    <div className="mt-2 text-sm">
                      <p>Check your spam folder if you don't see the email within a few minutes.</p>
                      <p>The reset link will expire in 1 hour.</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email address"
                disabled={emailSent}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || cooldown > 0 || emailSent}
            >
              {loading ? "Sending..." : 
               cooldown > 0 ? `Wait ${cooldown}s` :
               emailSent ? "Email Sent" :
               "Send Reset Instructions"}
            </Button>

            {emailSent && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="ghost"
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => {
                    setEmailSent(false)
                    setMessage("")
                    setEmail("")
                  }}
                >
                  Send to a different email
                </Button>
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <Link href="/signin" className="inline-flex items-center text-sm text-blue-600 hover:underline">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
