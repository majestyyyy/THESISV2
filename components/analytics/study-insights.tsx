"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, AlertTriangle, Lightbulb, Trophy } from "lucide-react"
import type { StudyInsight } from "@/lib/analytics-utils"

interface StudyInsightsProps {
  insights: StudyInsight[]
}

export function StudyInsights({ insights }: StudyInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case "strength":
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case "weakness":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case "recommendation":
        return <Lightbulb className="h-5 w-5 text-blue-600" />
      case "achievement":
        return <Trophy className="h-5 w-5 text-yellow-600" />
      default:
        return <Lightbulb className="h-5 w-5 text-gray-600" />
    }
  }

  const getInsightBadgeColor = (type: string) => {
    switch (type) {
      case "strength":
        return "bg-green-100 text-green-800"
      case "weakness":
        return "bg-red-100 text-red-800"
      case "recommendation":
        return "bg-blue-100 text-blue-800"
      case "achievement":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {insights.map((insight, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 border rounded-lg">
              <div className="flex-shrink-0 mt-1">{getInsightIcon(insight.type)}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium">{insight.title}</h4>
                  <Badge className={getInsightBadgeColor(insight.type)}>{insight.type}</Badge>
                </div>
                <p className="text-sm text-gray-600">{insight.description}</p>
                {insight.actionable && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-blue-600 font-medium">{insight.actionable}</p>
                    <Button size="sm" variant="outline">
                      Take Action
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
