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
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-orange-100 shadow-lg shadow-orange-100/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Study Insights</h3>
          <p className="text-gray-600 text-sm mt-1">AI-powered recommendations for your learning journey</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl">
          <Lightbulb className="h-5 w-5 text-orange-600" />
        </div>
      </div>
      <div className="space-y-4">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={`flex items-start space-x-4 p-5 rounded-2xl border-2 transition-all duration-300 hover:shadow-md ${
              insight.type === 'strength' ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 hover:border-green-300' :
              insight.type === 'weakness' ? 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 hover:border-red-300' :
              insight.type === 'recommendation' ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 hover:border-blue-300' :
              insight.type === 'achievement' ? 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 hover:border-yellow-300' :
              'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex-shrink-0 mt-1 p-2 rounded-xl bg-white/80 shadow-sm">
              {getInsightIcon(insight.type)}
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center space-x-3">
                <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                <Badge className={`${getInsightBadgeColor(insight.type)} px-3 py-1 rounded-full text-xs font-medium shadow-sm`}>
                  {insight.type}
                </Badge>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{insight.description}</p>
              {insight.actionable && (
                <div className="flex items-center justify-between pt-2 border-t border-white/50">
                  <p className="text-xs font-medium text-blue-700 bg-blue-100/50 px-3 py-1 rounded-full">
                    {insight.actionable}
                  </p>
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md rounded-xl px-4"
                  >
                    Take Action
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
