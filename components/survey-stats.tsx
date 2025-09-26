"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Target, Award } from "lucide-react"

interface SurveyStatsProps {
  className?: string
}

export function SurveyStats({ className }: SurveyStatsProps) {
  const [stats, setStats] = useState({
    totalResponses: 0,
    completionRate: 0,
    averageTime: 0,
    satisfactionScore: 0
  })

  useEffect(() => {
    // Simulate loading stats (in a real app, this would come from your backend)
    const loadStats = () => {
      // Get completion count from localStorage (demo purposes)
      const completedUsers = Object.keys(localStorage)
        .filter(key => key.startsWith('survey-completed-'))
        .length

      setStats({
        totalResponses: Math.max(completedUsers, Math.floor(Math.random() * 50) + 25),
        completionRate: Math.min(95, 75 + Math.floor(Math.random() * 20)),
        averageTime: 6 + Math.floor(Math.random() * 3),
        satisfactionScore: 4.2 + Math.random() * 0.6
      })
    }

    loadStats()
    const interval = setInterval(loadStats, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className={className}>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Survey Participation Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{stats.totalResponses}</span>
              </div>
              <p className="text-xs text-gray-600">Total Responses</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Target className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold text-green-600">{stats.completionRate}%</span>
              </div>
              <p className="text-xs text-gray-600">Completion Rate</p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Average Time</p>
                <span className="text-2xl font-bold text-blue-600">{stats.averageTime}m</span>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-2">
                <Award className="h-4 w-4 text-blue-600" />
                <span className="text-2xl font-bold text-blue-600">{stats.satisfactionScore.toFixed(1)}</span>
              </div>
              <p className="text-xs text-gray-600">Satisfaction</p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Participation Progress</span>
              <span>{stats.completionRate}% Complete</span>
            </div>
            <Progress value={stats.completionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
