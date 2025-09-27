"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function AnalyticsDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const runDiagnostic = async () => {
    setLoading(true)
    try {
      // Import and test analytics
      const { getUserAnalytics } = await import('@/lib/analytics-data')
      const analytics = await getUserAnalytics()
      setDiagnostics({ success: true, data: analytics })
    } catch (error) {
      setDiagnostics({ 
        success: false, 
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Analytics Diagnostic</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Analytics System</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={runDiagnostic} disabled={loading}>
            {loading ? 'Testing...' : 'Run Diagnostic'}
          </Button>
          
          {diagnostics && (
            <div className="mt-4 p-4 border rounded">
              {diagnostics.success ? (
                <div>
                  <h3 className="text-green-600 font-semibold">✅ Success!</h3>
                  <pre className="mt-2 text-sm bg-gray-100 p-2 rounded overflow-auto">
                    {JSON.stringify(diagnostics.data, null, 2)}
                  </pre>
                </div>
              ) : (
                <div>
                  <h3 className="text-red-600 font-semibold">❌ Error</h3>
                  <p className="mt-2 text-red-600">{diagnostics.error}</p>
                  {diagnostics.stack && (
                    <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
                      {diagnostics.stack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}