"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SurveyBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user has dismissed the banner recently
    const lastDismissed = localStorage.getItem("survey-banner-dismissed")
    const now = Date.now()
    const oneDayAgo = now - 24 * 60 * 60 * 1000 // 24 hours

    if (!lastDismissed || parseInt(lastDismissed) < oneDayAgo) {
      // Show banner after a short delay to let user explore first
      const timer = setTimeout(() => {
        setShowBanner(true)
      }, 30000) // Show after 30 seconds

      return () => clearTimeout(timer)
    }
  }, [])

  const dismissBanner = () => {
    setShowBanner(false)
    localStorage.setItem("survey-banner-dismissed", Date.now().toString())
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-4 right-4 max-w-sm bg-gradient-to-r from-pink-500 to-rose-500 text-white p-4 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom-4">
      <button
        onClick={dismissBanner}
        className="absolute top-2 right-2 text-white/80 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>
      
      <div className="flex items-start space-x-3">
        <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
          <MessageSquare className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">Help Our Research!</h3>
          <p className="text-xs text-white/90 mb-3">
            Share your experience with our system by taking a quick survey.
          </p>
          <Link href="/survey">
            <Button
              size="sm"
              className="bg-white text-pink-600 hover:bg-white/90 text-xs"
              onClick={dismissBanner}
            >
              Take Survey
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
