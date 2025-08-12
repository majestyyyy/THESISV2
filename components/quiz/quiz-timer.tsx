"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Clock, AlertTriangle } from "lucide-react"
import { formatTime } from "@/lib/quiz-session"

interface QuizTimerProps {
  initialTime: number // in seconds
  onTimeUp: () => void
  isPaused?: boolean
}

export function QuizTimer({ initialTime, onTimeUp, isPaused = false }: QuizTimerProps) {
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

  const progressPercentage = (timeRemaining / initialTime) * 100
  const isLowTime = timeRemaining <= 300 // 5 minutes
  const isCriticalTime = timeRemaining <= 60 // 1 minute

  return (
    <Card className={`${isCriticalTime ? "border-red-500" : isLowTime ? "border-yellow-500" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isCriticalTime ? (
              <AlertTriangle className="h-5 w-5 text-red-500" />
            ) : (
              <Clock className="h-5 w-5 text-gray-500" />
            )}
            <span
              className={`font-mono text-lg font-semibold ${
                isCriticalTime ? "text-red-600" : isLowTime ? "text-yellow-600" : "text-gray-900"
              }`}
            >
              {formatTime(timeRemaining)}
            </span>
          </div>
          <div className="flex-1">
            <Progress
              value={progressPercentage}
              className={`h-2 ${isCriticalTime ? "bg-red-100" : isLowTime ? "bg-yellow-100" : ""}`}
            />
          </div>
        </div>
        {isLowTime && (
          <p className={`text-xs mt-2 ${isCriticalTime ? "text-red-600" : "text-yellow-600"}`}>
            {isCriticalTime ? "Time is running out!" : "Less than 5 minutes remaining"}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
