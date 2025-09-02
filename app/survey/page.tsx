"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/components/auth/auth-provider"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  MessageSquare, 
  Clock, 
  Users, 
  Heart, 
  ArrowLeft, 
  CheckCircle,
  Star,
  Lightbulb,
  Shield
} from "lucide-react"

export default function SurveyPage() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)
  const [surveyCompleted, setSurveyCompleted] = useState(false)

  useEffect(() => {
    // Check if user has completed survey
    const completed = localStorage.getItem(`survey-completed-${user?.id}`)
    if (completed) {
      setSurveyCompleted(true)
    }
    
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [user?.id])

  const markSurveyCompleted = () => {
    if (user?.id) {
      localStorage.setItem(`survey-completed-${user.id}`, 'true')
      setSurveyCompleted(true)
    }
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          {/* Header Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl mb-8 p-8 text-white">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  <Star className="h-3 w-3 mr-1" />
                  Research Participation
                </Badge>
              </div>
              
              <div className="max-w-3xl">
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                  Help Shape the Future of AI Education
                </h1>
                <p className="text-xl text-blue-100 mb-6">
                  Your experience with our AI-powered learning system is invaluable to our research. 
                  Share your insights to help us improve educational technology for students worldwide.
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>5-8 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Completely anonymous</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>Helping improve education</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 translate-x-8"></div>
          </div>

          {surveyCompleted ? (
            /* Thank You Section */
            <Card className="max-w-2xl mx-auto">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Thank You!</h2>
                <p className="text-gray-600 mb-6">
                  Your feedback has been submitted successfully. Your insights will help us improve 
                  the AI-powered educational experience for future students.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/dashboard">
                    <Button className="w-full sm:w-auto">
                      Continue Learning
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      localStorage.removeItem(`survey-completed-${user?.id}`)
                      setSurveyCompleted(false)
                    }}
                    className="w-full sm:w-auto"
                  >
                    Take Survey Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Survey Section */
            <div className="space-y-6">
              {/* Instructions Card */}
              {/* Survey Form */}
              <Card className="overflow-hidden shadow-lg">
                <CardContent className="p-0">
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-gradient-to-br from-blue-50 to-indigo-50">
                      <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-600 border-t-transparent absolute top-0 left-0"></div>
                      </div>
                      <div className="mt-6 text-center">
                        <p className="text-lg font-medium text-gray-700 mb-2">Loading Survey</p>
                        <p className="text-sm text-gray-500">Preparing your personalized research questionnaire...</p>
                      </div>
                      <div className="mt-4 flex space-x-1">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <iframe
                        src="https://forms.gle/FfhxbYsg1e8gVrx78"
                        width="100%"
                        height="900"
                        frameBorder="0"
                        marginHeight={0}
                        marginWidth={0}
                        title="AI-GIR Research Survey - Help improve educational AI technology"
                        className="w-full transition-opacity duration-500"
                        onLoad={() => setIsLoading(false)}
                        aria-label="Research survey form for AI-GIR educational platform feedback"
                      >
                        <p>
                          Your browser does not support iframes. Please{' '}
                          <a 
                            href="https://forms.gle/FfhxbYsg1e8gVrx78" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            access the survey directly here
                          </a>
                          .
                        </p>
                      </iframe>
                      
                      {/* Survey Progress Indicator */}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm">
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span>Survey Active</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="font-medium text-gray-900">Completed the survey?</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Click below to mark it as completed and help us track participation
                  </p>
                  <Button 
                    onClick={markSurveyCompleted}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Completed
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Footer Information */}
          <div className="mt-12 text-center space-y-4">
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>Research Study</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>Anonymous Participation</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 max-w-2xl mx-auto">
              This research study is being conducted to evaluate the effectiveness of AI-powered 
              educational tools. Your participation is voluntary and all responses are confidential.
            </p>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
