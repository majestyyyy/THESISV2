"use client"

import React, { useState, useEffect } from 'react'
import { HelpCircle, X, ChevronRight, ChevronLeft, Upload, FileText, BookOpen, BarChart3, MessageSquare, Play, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/auth/auth-provider'

interface HelpStep {
  id: string
  title: string
  description: string
  icon: React.ElementType
  details: string[]
}

const helpSteps: HelpStep[] = [
  {
    id: 'upload',
    title: 'Upload Study Materials',
    description: 'Start by uploading your study files (PDF)',
    icon: Upload,
    details: [
      'Click "Upload New File" on your dashboard',
      'Select PDF files from your device',
      'Wait for the file to be processed',
      'Your file will appear in your source file'
    ]
  },
  {
    id: 'quiz',
    title: 'Generate & Take Quizzes',
    description: 'Create AI-powered quizzes from your materials',
    icon: FileText,
    details: [
      'Go to "Take a Quiz" from the dashboard',
      'Select a file to generate quiz from',
      'Choose quiz settings (difficulty, question count)',
      'Take the quiz and get instant feedback'
    ]
  },
  {
    id: 'library',
    title: 'Manage Your Library',
    description: 'Access and organize your uploaded materials',
    icon: BookOpen,
    details: [
      'Browse all your uploaded files',
      'Generate reviewers from your materials',
      'View file details and processing status',
      'Delete files you no longer need'
    ]
  },
  {
    id: 'analytics',
    title: 'Track Your Progress',
    description: 'Monitor your learning performance and patterns',
    icon: BarChart3,
    details: [
      'View your quiz performance over time',
      'See which topics you excel at',
      'Identify areas that need improvement',
      'Track your learning consistency'
    ]
  },
  {
    id: 'survey',
    title: 'Share Feedback',
    description: 'Help improve the platform with your input',
    icon: MessageSquare,
    details: [
      'Participate in research surveys',
      'Share your experience using the platform',
      'Suggest new features or improvements',
      'Help make AI-GiR better for everyone'
    ]
  }
]

interface FloatingHelpButtonProps {
  className?: string
}

export function FloatingHelpButton({ className = '' }: FloatingHelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false)
  const { user, loading } = useAuth()

  useEffect(() => {
    // Only show tutorial for authenticated users
    if (!user || loading) return

    // Check if user has seen the tutorial before
    const tutorialSeen = localStorage.getItem(`ai-gir-tutorial-seen-${user.id}`)
    if (!tutorialSeen) {
      // Show tutorial for new users after a short delay
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 3000) // Increased delay to 3 seconds for better UX
      return () => clearTimeout(timer)
    } else {
      setHasSeenTutorial(true)
    }
  }, [user, loading])

  const handleClose = () => {
    setIsOpen(false)
    if (!hasSeenTutorial && user) {
      localStorage.setItem(`ai-gir-tutorial-seen-${user.id}`, 'true')
      setHasSeenTutorial(true)
    }
  }

  const nextStep = () => {
    if (currentStep < helpSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const currentHelpStep = helpSteps[currentStep]
  const IconComponent = currentHelpStep.icon

  // Don't render anything if user is not authenticated
  if (!user || loading) {
    return null
  }

  return (
    <>
      {/* Floating Help Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-110 ${className}`}
        size="icon"
      >
        <HelpCircle className="h-6 w-6 text-white" />
        <span className="sr-only">Open help</span>
      </Button>

      {/* Help Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-4 shrink-0">
              <div>
                <CardTitle className="text-xl font-bold">
                  {!hasSeenTutorial ? 'Welcome to AI-GiR!' : 'How to Use AI-GiR'}
                </CardTitle>
                <CardDescription>
                  {!hasSeenTutorial 
                    ? 'Let\'s get you started with a quick tour of the platform'
                    : 'Learn how to make the most of your AI-powered learning platform'
                  }
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="space-y-6 overflow-y-auto flex-1 min-h-0">
              {/* Progress indicators */}
              <div className="flex items-center justify-center space-x-2">
                {helpSteps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-blue-600'
                        : index < currentStep
                        ? 'bg-blue-300'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Current step content */}
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <IconComponent className="h-8 w-8 text-blue-600" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">{currentHelpStep.title}</h3>
                  <p className="text-gray-600 mb-4">{currentHelpStep.description}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Play className="h-4 w-4 mr-2 text-blue-600" />
                    Step-by-step:
                  </h4>
                  <ul className="space-y-2">
                    {currentHelpStep.details.map((detail, index) => (
                      <li key={index} className="flex items-start">
                        <Badge variant="outline" className="mr-2 mt-0.5 shrink-0">
                          {index + 1}
                        </Badge>
                        <span className="text-sm text-gray-700">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Contact Support */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <h4 className="font-medium text-blue-900">Need Help?</h4>
                </div>
                <p className="text-sm text-blue-700 mb-2">
                  If you have questions or need assistance, feel free to contact our support team:
                </p>
                <a
                  href="mailto:parungao.johnlloyd@ue.edu.ph"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                >
                  <Mail className="h-3 w-3 mr-1" />
                  parungao.johnlloyd@ue.edu.ph
                </a>
              </div>

            </CardContent>

            {/* Navigation - Fixed at bottom */}
            <div className="border-t border-gray-200 p-6 shrink-0">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>

                <span className="text-sm text-gray-500">
                  {currentStep + 1} of {helpSteps.length}
                </span>

                {currentStep < helpSteps.length - 1 ? (
                  <Button onClick={nextStep} className="flex items-center">
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                ) : (
                  <Button onClick={handleClose} className="bg-green-600 hover:bg-green-700">
                    Get Started!
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}