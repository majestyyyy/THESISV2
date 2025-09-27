# Analytics Troubleshooting Guide

## Quick Fix Steps

### 1. Authentication Check
- **Issue**: `session from storage null` in terminal logs
- **Fix**: Sign in at http://localhost:3001/signin
- **Verify**: You should see user email in terminal logs after signing in

### 2. Database Migration Required
- **Issue**: `relation "study_sessions" does not exist` or similar database errors
- **Fix**: 
  1. Go to Supabase Dashboard → SQL Editor
  2. Copy contents of `scripts/06-analytics-enhancement-fixed.sql`
  3. Paste and run the entire script
  4. Look for "Analytics enhancement completed successfully!" message

### 3. Initialize Analytics System
- **Issue**: No analytics data showing
- **Fix**: 
  1. Go to http://localhost:3001/analytics/setup
  2. Click "Run Setup" button
  3. Wait for all steps to complete successfully

## Diagnostic Pages

### Available Test Pages:
- **Setup Page**: http://localhost:3001/analytics/setup
- **Diagnostic Page**: http://localhost:3001/analytics/diagnostic  
- **Test Page**: http://localhost:3001/analytics/test
- **Main Analytics**: http://localhost:3001/analytics

## Common Errors and Solutions

### Error: "User not authenticated"
- **Cause**: Not signed in
- **Solution**: Sign in at `/signin` first

### Error: "relation does not exist"
- **Cause**: Database migration not run
- **Solution**: Run the SQL migration script in Supabase

### Error: "Failed to load analytics data"
- **Cause**: Database tables missing or user not initialized
- **Solution**: Run database migration, then visit setup page

### Error: Analytics showing zeros/empty
- **Cause**: No analytics data created yet
- **Solution**: 
  1. Upload some files at `/upload`
  2. Take some quizzes at `/quizzes`
  3. Generate some reviewers at `/library`
  4. Visit setup page to create sample data

## Database Tables Created

The migration creates these tables:
- `study_sessions` - Track learning sessions
- `question_attempts` - Individual question performance
- `user_preferences` - User settings and preferences  
- `learning_streaks` - Daily activity tracking
- `user_analytics_summary` - Aggregated analytics view

## Manual Verification

You can manually check if tables exist in Supabase:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('study_sessions', 'learning_streaks', 'question_attempts', 'user_preferences');

-- Check user data
SELECT * FROM user_analytics_summary WHERE user_id = auth.uid() LIMIT 1;
```

## Support

If issues persist:
1. Check browser console for JavaScript errors
2. Check Supabase logs for database errors
3. Verify RLS policies are enabled
4. Ensure user has proper permissions