// Run this script to initialize analytics for your application
import { supabase } from './supabase'
import { enhanceExistingDataWithSubjects, initializeUserPreferences } from './analytics-integration'

export async function initializeAnalytics() {
  console.log('Initializing analytics system...')
  
  try {
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('No authenticated user found')
      return false
    }

    console.log('Authenticated user:', user.email)

    // Initialize user preferences
    await initializeUserPreferences()
    console.log('✓ User preferences initialized')

    // Enhance existing data with subjects
    await enhanceExistingDataWithSubjects()
    console.log('✓ Existing data enhanced with subjects')

    // Create initial learning streak entry for today if user has any activity
    const today = new Date().toISOString().split('T')[0]
    const { data: existingStreak } = await supabase
      .from('learning_streaks')
      .select('*')
      .eq('user_id', user.id)
      .eq('streak_date', today)
      .single()

    if (!existingStreak) {
      // Check if user has any activity today
      const { data: todayAttempts } = await supabase
        .from('quiz_attempts')
        .select('id')
        .eq('user_id', user.id)
        .gte('completed_at', today)

      if (todayAttempts && todayAttempts.length > 0) {
        await supabase.from('learning_streaks').insert({
          user_id: user.id,
          streak_date: today,
          activities_count: todayAttempts.length,
          quizzes_completed: todayAttempts.length
        })
        console.log('✓ Initial learning streak created')
      }
    }

    console.log('Analytics initialization complete!')
    return true
  } catch (error) {
    console.error('Error initializing analytics:', error)
    return false
  }
}

// Function to run database migrations
export async function runAnalyticsMigrations() {
  console.log('Running analytics database migrations...')
  
  try {
    // Check if new tables exist
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['study_sessions', 'question_attempts', 'user_preferences', 'learning_streaks'])

    const existingTables = tables?.map(t => t.table_name) || []
    
    console.log('Existing analytics tables:', existingTables)
    
    if (existingTables.length < 4) {
      console.log('⚠️  Some analytics tables are missing.')
      console.log('Please run the 06-analytics-enhancement.sql script in your Supabase SQL editor.')
      return false
    }

    console.log('✓ All analytics tables exist')
    return true
  } catch (error) {
    console.error('Error checking database migrations:', error)
    return false
  }
}

// Function to test analytics functionality
export async function testAnalytics() {
  console.log('Testing analytics functionality...')
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('No authenticated user for testing')
      return false
    }

    // Test basic data retrieval
    const { getUserAnalytics } = await import('./analytics-data')
    const analytics = await getUserAnalytics()
    
    console.log('Analytics data retrieved:', {
      totalStudyTime: analytics.totalStudyTime,
      quizzesTaken: analytics.quizzesTaken,
      studyStreak: analytics.studyStreak,
      filesUploaded: analytics.filesUploaded,
      reviewersGenerated: analytics.reviewersGenerated
    })

    console.log('✓ Analytics test successful')
    return true
  } catch (error) {
    console.error('Error testing analytics:', error)
    return false
  }
}

// Complete setup function
export async function setupAnalytics() {
  console.log('🚀 Starting analytics setup...')
  
  const migrationsOk = await runAnalyticsMigrations()
  if (!migrationsOk) {
    console.log('❌ Database migrations failed')
    return false
  }

  const initOk = await initializeAnalytics()
  if (!initOk) {
    console.log('❌ Analytics initialization failed')
    return false
  }

  const testOk = await testAnalytics()
  if (!testOk) {
    console.log('❌ Analytics test failed')
    return false
  }

  console.log('✅ Analytics setup complete!')
  console.log('You can now:')
  console.log('1. View analytics at /analytics')
  console.log('2. Track study sessions automatically')
  console.log('3. Monitor learning progress')
  
  return true
}