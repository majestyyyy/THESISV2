"use client"

import { useEffect, useState } from 'react'

export function SurveyNotificationBadge() {
  const [showBadge, setShowBadge] = useState(false)

  useEffect(() => {
    const surveyCompleted = localStorage.getItem("survey-completed")
    const surveyInteracted = localStorage.getItem("survey-banner-dismissed")
    
    // Show badge if user hasn't completed survey and hasn't interacted with banner recently
    if (!surveyCompleted) {
      setShowBadge(true)
    }
  }, [])

  if (!showBadge) return null

  return (
    <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse">
      <span className="sr-only">New survey available</span>
    </span>
  )
}