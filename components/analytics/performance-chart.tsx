"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { TrendingUp, BookOpen } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface PerformanceChartProps {
  data: Array<{ week: string; score: number; time: number }>
  type: "line" | "bar"
}

export function PerformanceChart({ data, type }: PerformanceChartProps) {
  const chartConfig = {
    score: {
      label: "Score",
      color: "hsl(var(--chart-1))",
    },
    time: {
      label: "Study Time",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-blue-100 shadow-lg shadow-blue-100/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Weekly Progress</h3>
          <p className="text-gray-600 text-sm mt-1">Your performance and study time over the past 4 weeks</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
          <TrendingUp className="h-5 w-5 text-blue-600" />
        </div>
      </div>
      <div className="w-full h-[280px] md:h-[320px] overflow-hidden">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            {type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="week" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                yAxisId="left" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="score"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: "#1d4ed8" }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="time"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: "#10b981", strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: "#059669" }}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="week" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar 
                dataKey="score" 
                fill="url(#colorGradient)" 
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
              </defs>
            </BarChart>
          )}
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}

interface SubjectPerformanceChartProps {
  data: Array<{ subject: string; averageScore: number; timeSpent: number }>
}

export function SubjectPerformanceChart({ data }: SubjectPerformanceChartProps) {
  const chartConfig = {
    averageScore: {
      label: "Average Score",
      color: "hsl(var(--chart-1))",
    },
    timeSpent: {
      label: "Time Spent",
      color: "hsl(var(--chart-2))",
    },
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-purple-100 shadow-lg shadow-purple-100/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Subject Performance</h3>
          <p className="text-gray-600 text-sm mt-1">Your performance across different subjects</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
          <BookOpen className="h-5 w-5 text-purple-600" />
        </div>
      </div>
      <div className="w-full h-[280px] md:h-[320px] overflow-hidden">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              type="number" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis 
              dataKey="subject" 
              type="category" 
              width={100}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar 
              dataKey="averageScore" 
              fill="url(#purpleGradient)" 
              radius={[0, 4, 4, 0]}
            />
            <defs>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}

interface DifficultyBreakdownChartProps {
  data: Array<{ difficulty: string; count: number; averageScore: number }>
}

export function DifficultyBreakdownChart({ data }: DifficultyBreakdownChartProps) {
  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]
  const gradientColors = [
    { id: "easy", colors: ["#10b981", "#059669"] },
    { id: "medium", colors: ["#f59e0b", "#d97706"] },
    { id: "hard", colors: ["#ef4444", "#dc2626"] },
    { id: "expert", colors: ["#8b5cf6", "#7c3aed"] }
  ]

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-green-100 shadow-lg shadow-green-100/50 hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Quiz Difficulty Distribution</h3>
          <p className="text-gray-600 text-sm mt-1">Breakdown of quizzes by difficulty level</p>
        </div>
        <div className="p-3 bg-gradient-to-br from-green-100 to-green-200 rounded-xl">
          <TrendingUp className="h-5 w-5 text-green-600" />
        </div>
      </div>
      <div className="space-y-4">
        <div className="w-full h-[240px] md:h-[280px] overflow-hidden flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <PieChart>
              <defs>
                {gradientColors.map((gradient) => (
                  <linearGradient key={gradient.id} id={gradient.id} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={gradient.colors[0]} />
                    <stop offset="100%" stopColor={gradient.colors[1]} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius="75%"
                innerRadius="45%"
                fill="#8884d8"
                dataKey="count"
                stroke="#ffffff"
                strokeWidth={3}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#${entry.difficulty.toLowerCase()})`}
                  />
                ))}
              </Pie>
              <ChartTooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="bg-white/95 backdrop-blur-sm p-3 rounded-lg border border-gray-200 shadow-lg">
                        <p className="font-medium">{data.difficulty}</p>
                        <p className="text-sm text-gray-600">Count: {data.count}</p>
                        <p className="text-sm text-gray-600">Avg Score: {data.averageScore}%</p>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend */}
        <div className="grid grid-cols-2 gap-3">
          {data.map((entry, index) => {
            const totalQuizzes = data.reduce((sum, item) => sum + item.count, 0)
            const percentage = totalQuizzes > 0 ? Math.round((entry.count / totalQuizzes) * 100) : 0
            return (
              <div 
                key={entry.difficulty} 
                className="flex items-center space-x-3 p-3 bg-white/50 rounded-xl border border-gray-200/50 hover:bg-white/70 transition-all duration-200"
              >
                <div 
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${gradientColors[index]?.colors[0] || '#6b7280'}, ${gradientColors[index]?.colors[1] || '#4b5563'})` }}
                ></div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{entry.difficulty}</p>
                  <p className="text-xs text-gray-600">{entry.count} quizzes ({percentage}%)</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-700">{entry.averageScore}%</p>
                  <p className="text-xs text-gray-500">avg</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
