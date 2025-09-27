"use client"

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, FileText, BookOpen, BarChart3, MessageSquare, CheckCircle, ArrowRight, Lightbulb, Target, TrendingUp, Mail } from 'lucide-react'

export function QuickStartGuide() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Lightbulb className="h-4 w-4 text-white" />
            </div>
            <CardTitle className="text-xl">Welcome to AI-GiR!</CardTitle>
          </div>
          <CardDescription className="text-base">
            Your AI-powered learning companion. Transform any study material into interactive quizzes and track your progress.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Steps */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Upload className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">1. Upload Files</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">Start by uploading your study materials</p>
            <ul className="space-y-1 text-xs text-gray-500">
              <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> PDF documents</li>
              <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Word documents (DOCX)</li>
              <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Text files (TXT)</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">2. Generate Quizzes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">AI creates personalized quizzes from your content</p>
            <ul className="space-y-1 text-xs text-gray-500">
              <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Multiple choice questions</li>
              <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> True/false questions</li>
              <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Instant feedback</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">3. Track Progress</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-gray-600">Monitor your learning journey</p>
            <ul className="space-y-1 text-xs text-gray-500">
              <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Performance analytics</li>
              <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Learning patterns</li>
              <li className="flex items-center"><CheckCircle className="h-3 w-3 mr-1 text-green-500" /> Improvement areas</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Key Features</span>
          </CardTitle>
          <CardDescription>Everything you need for effective learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <BookOpen className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Smart Library</h4>
                  <p className="text-sm text-gray-600">Organize and access all your study materials in one place</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Performance Analytics</h4>
                  <p className="text-sm text-gray-600">Detailed insights into your learning progress and patterns</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Research Participation</h4>
                  <p className="text-sm text-gray-600">Help improve AI-powered learning through surveys</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <ArrowRight className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium">Instant Generation</h4>
                  <p className="text-sm text-gray-600">Get quizzes and reviewers generated in seconds</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-amber-800">
            <Lightbulb className="h-5 w-5" />
            <span>Pro Tips</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-amber-700">
            <div className="flex items-start space-x-2">
              <Badge variant="outline" className="mt-0.5 border-amber-300 text-amber-700">1</Badge>
              <p>Upload high-quality, well-structured documents for better quiz generation</p>
            </div>
            <div className="flex items-start space-x-2">
              <Badge variant="outline" className="mt-0.5 border-amber-300 text-amber-700">2</Badge>
              <p>Take quizzes regularly to reinforce your learning and improve retention</p>
            </div>
            <div className="flex items-start space-x-2">
              <Badge variant="outline" className="mt-0.5 border-amber-300 text-amber-700">3</Badge>
              <p>Check your analytics to identify topics that need more attention</p>
            </div>
            <div className="flex items-start space-x-2">
              <Badge variant="outline" className="mt-0.5 border-amber-300 text-amber-700">4</Badge>
              <p>Use the floating help button (bottom-right) anytime you need guidance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Support */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <Mail className="h-5 w-5" />
            <span>Need Help?</span>
          </CardTitle>
          <CardDescription className="text-blue-700">
            Have questions or need assistance? Our support team is here to help you succeed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Mail className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Contact Support</p>
              <a
                href="mailto:parungao.johnlloyd@ue.edu.ph"
                className="text-sm text-blue-600 hover:text-blue-700 underline font-medium"
              >
                parungao.johnlloyd@ue.edu.ph
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}