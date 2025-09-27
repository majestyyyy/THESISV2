import { AnalyticsSetup } from '@/components/analytics/analytics-setup'
import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

export default function AnalyticsSetupPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="container mx-auto py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Set Up Analytics
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Configure comprehensive analytics tracking to monitor your learning progress, 
              study patterns, and performance insights.
            </p>
          </div>
          <AnalyticsSetup />
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}