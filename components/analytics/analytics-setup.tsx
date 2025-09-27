"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface SetupStep {
  name: string
  description: string
  status: 'pending' | 'running' | 'success' | 'error'
  error?: string
}

export function AnalyticsSetup() {
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      name: 'Database Migrations',
      description: 'Check if analytics tables exist',
      status: 'pending'
    },
    {
      name: 'Initialize User Data',
      description: 'Set up user preferences and enhance existing data',
      status: 'pending'
    },
    {
      name: 'Test Analytics',
      description: 'Verify analytics functionality works correctly',
      status: 'pending'
    }
  ])

  const [isRunning, setIsRunning] = useState(false)
  const [completed, setCompleted] = useState(false)

  const updateStepStatus = (index: number, status: SetupStep['status'], error?: string) => {
    setSteps(prev => prev.map((step, i) => 
      i === index ? { ...step, status, error } : step
    ))
  }

  const runSetup = async () => {
    setIsRunning(true)
    setCompleted(false)

    try {
      // Step 1: Check database migrations
      updateStepStatus(0, 'running')
      const { runAnalyticsMigrations } = await import('@/lib/analytics-setup')
      const migrationsOk = await runAnalyticsMigrations()
      updateStepStatus(0, migrationsOk ? 'success' : 'error', 
        migrationsOk ? undefined : 'Please run the SQL migration script')

      if (!migrationsOk) {
        setIsRunning(false)
        return
      }

      // Step 2: Initialize analytics
      updateStepStatus(1, 'running')
      const { initializeAnalytics } = await import('@/lib/analytics-setup')
      const initOk = await initializeAnalytics()
      updateStepStatus(1, initOk ? 'success' : 'error',
        initOk ? undefined : 'Failed to initialize analytics')

      if (!initOk) {
        setIsRunning(false)
        return
      }

      // Step 3: Test analytics
      updateStepStatus(2, 'running')
      const { testAnalytics } = await import('@/lib/analytics-setup')
      const testOk = await testAnalytics()
      updateStepStatus(2, testOk ? 'success' : 'error',
        testOk ? undefined : 'Analytics test failed')

      if (testOk) {
        setCompleted(true)
      }
    } catch (error) {
      console.error('Setup error:', error)
      const currentRunningStep = steps.findIndex(step => step.status === 'running')
      if (currentRunningStep !== -1) {
        updateStepStatus(currentRunningStep, 'error', error instanceof Error ? error.message : 'Unknown error')
      }
    } finally {
      setIsRunning(false)
    }
  }

  const getStepIcon = (status: SetupStep['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Analytics Setup</CardTitle>
        <CardDescription>
          Set up comprehensive analytics tracking for your learning platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.name} className="flex items-start space-x-3">
              {getStepIcon(step.status)}
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{step.name}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
                {step.error && (
                  <p className="text-sm text-red-600 mt-1">{step.error}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {!completed && (
          <Button 
            onClick={runSetup} 
            disabled={isRunning}
            className="w-full"
          >
            {isRunning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up analytics...
              </>
            ) : (
              'Start Setup'
            )}
          </Button>
        )}

        {completed && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h4 className="font-medium text-green-900">Setup Complete!</h4>
            </div>
            <p className="text-sm text-green-800 mt-1">
              Analytics is now fully configured. You can view your learning analytics at /analytics
            </p>
          </div>
        )}

        {steps.some(step => step.status === 'error') && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <h4 className="font-medium text-yellow-900">Setup Issues Detected</h4>
            </div>
            <div className="text-sm text-yellow-800 mt-2 space-y-1">
              <p>If database migration failed, you need to:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open your Supabase dashboard</li>
                <li>Go to SQL Editor</li>
                <li>Run the contents of scripts/06-analytics-enhancement.sql</li>
                <li>Try setup again</li>
              </ol>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}