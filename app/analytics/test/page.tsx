import { supabase } from '@/lib/supabase'

export default async function AnalyticsTest() {
  try {
    // Test if analytics tables exist
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return (
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Analytics Setup Test</h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p><strong>Status:</strong> User not authenticated</p>
            <p><strong>Action:</strong> Please sign in first to test analytics</p>
          </div>
        </div>
      )
    }

    // Test table access
    const testResults = await Promise.allSettled([
      supabase.from('study_sessions').select('count').limit(1),
      supabase.from('learning_streaks').select('count').limit(1),
      supabase.from('question_attempts').select('count').limit(1),
      supabase.from('user_preferences').select('count').limit(1),
      supabase.from('user_analytics_summary').select('*').limit(1)
    ])

    const tableTests = [
      'study_sessions',
      'learning_streaks', 
      'question_attempts',
      'user_preferences',
      'user_analytics_summary'
    ]

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Analytics Setup Test</h1>
        <div className="space-y-4">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            <p><strong>User:</strong> {user.email}</p>
            <p><strong>Status:</strong> Authenticated ✓</p>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">Database Tables Test</h2>
            <div className="space-y-2">
              {testResults.map((result, index) => {
                const tableName = tableTests[index]
                const isSuccess = result.status === 'fulfilled' && !result.value.error
                
                return (
                  <div key={tableName} className="flex items-center justify-between">
                    <span className="font-mono text-sm">{tableName}</span>
                    <span className={`px-2 py-1 rounded text-xs ${
                      isSuccess 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {isSuccess ? '✓ EXISTS' : '✗ MISSING'}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {testResults.some(r => r.status === 'rejected' || (r.status === 'fulfilled' && r.value.error)) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <p><strong>Action Required:</strong></p>
              <p>Some tables are missing. Please run the database migration:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Go to Supabase Dashboard</li>
                <li>Open SQL Editor</li>
                <li>Run the script: <code>scripts/06-analytics-enhancement-fixed.sql</code></li>
              </ol>
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Analytics Setup Test</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p><strong>Error:</strong> {error instanceof Error ? error.message : 'Unknown error'}</p>
        </div>
      </div>
    )
  }
}