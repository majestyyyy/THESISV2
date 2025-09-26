"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Clock, Eye, EyeOff } from "lucide-react"
import { formatTime } from "@/lib/quiz-session"

interface QuizTimerProps {
  initialTime: number // in seconds
  onTimeUp: () => void
  isPaused?: boolean
  isVisible?: boolean
  onToggleVisibility?: () => void
}

export function QuizTimer({ initialTime, onTimeUp, isPaused = false, isVisible = true, onToggleVisibility }: QuizTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime)

  useEffect(() => {
    if (isPaused || timeRemaining <= 0) return

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [timeRemaining, onTimeUp, isPaused])

  const isCriticalTime = timeRemaining <= 60 // 1 minute

  // If timer is hidden, show only toggle button
  if (!isVisible) {
    return (
      <div className="flex items-center space-x-2">
        {onToggleVisibility && (
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleVisibility}
            className="text-gray-600 hover:text-gray-800"
          >
            <Eye className="h-4 w-4 mr-1" />
            Show Timer
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3 bg-white rounded-lg border border-gray-200 px-4 py-2 shadow-sm">
      <Clock className={`h-4 w-4 ${isCriticalTime ? 'text-red-500' : 'text-gray-500'}`} />
      
      <span className={`font-mono text-lg font-semibold ${
        isCriticalTime ? 'text-red-600' : 'text-gray-900'
      }`}>
        {formatTime(timeRemaining)}
      </span>

      {onToggleVisibility && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleVisibility}
          className="text-gray-400 hover:text-gray-600 p-1"
        >
          <EyeOff className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
