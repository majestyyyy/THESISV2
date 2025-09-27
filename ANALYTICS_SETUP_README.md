# Analytics Integration Setup

This guide explains how to integrate comprehensive analytics functionality into your learning platform.

## ⚠️ **IMPORTANT: Database Schema Fix**

If you encounter the error `column f.created_at does not exist`, use the **fixed** migration script:
- **Use**: `scripts/06-analytics-enhancement-fixed.sql` ✅
- **Avoid**: `scripts/06-analytics-enhancement.sql` (has column reference issues)

## 🎯 What's Been Implemented

### 1. Database Schema Enhancements
- **Study Sessions Table**: Tracks all user study activities with duration and metadata
- **Question Attempts Table**: Records individual question performance for detailed analytics
- **User Preferences Table**: Stores user learning preferences and goals
- **Learning Streaks Table**: Automatic daily activity tracking with triggers
- **Enhanced Tables**: Added subject and difficulty columns to existing tables

### 2. Analytics Data Service (`lib/analytics-data.ts`)
- Real-time data fetching from Supabase
- Comprehensive metrics calculation
- Subject-based performance analysis
- Difficulty progression tracking
- Study streak calculation
- Weekly progress trends

### 3. Study Session Tracking (`lib/study-session-tracker.ts`)
- Automatic session start/end tracking
- Activity type classification (quiz, upload, review, generate, study)
- Real-time duration calculation
- Metadata storage for detailed analysis

### 4. Integration Hooks (`lib/analytics-integration.ts`)
- `useQuizAnalytics()`: Track quiz sessions and question attempts
- `useFileAnalytics()`: Track file uploads and subject classification
- `useReviewerAnalytics()`: Track study guide generation
- `useStudyAnalytics()`: General study session management

### 5. Setup and Migration Tools
- **SQL Migration Script**: `scripts/06-analytics-enhancement.sql`
- **Setup Service**: `lib/analytics-setup.ts`
- **Setup Component**: `components/analytics/analytics-setup.tsx`
- **Setup Page**: `app/analytics/setup/page.tsx`

### 6. Enhanced Analytics Page
- Real data integration (replaces mock data)
- Loading states and error handling
- Performance charts with real metrics
- Subject performance breakdowns
- Study insights and recommendations

## 🚀 How to Set Up Analytics

### Step 1: Run Database Migration
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and paste the contents of `scripts/06-analytics-enhancement-fixed.sql` ✅
4. Run the script (should complete without errors)

### Step 2: Initialize Analytics
1. Visit `/analytics/setup` in your app
2. Click "Start Setup" to run the initialization
3. Wait for all steps to complete successfully

### Step 3: Start Using Analytics
1. Visit `/analytics` to view your learning analytics
2. Analytics will automatically track:
   - Quiz attempts and scores
   - Study session duration
   - File uploads and processing
   - Study guide generation
   - Daily activity streaks

## 📊 Data Being Tracked

### Core Metrics
- **Total Study Time**: Accumulated from quiz attempts and study sessions
- **Average Score**: Calculated from all quiz attempts
- **Quiz Count**: Number of quizzes completed
- **Study Streak**: Consecutive days with learning activity
- **Files Uploaded**: Count of uploaded study materials
- **Study Guides Created**: Count of generated reviewers

### Advanced Analytics
- **Weekly Progress**: Performance and time trends over 4 weeks
- **Subject Performance**: Breakdown by subject with time spent
- **Difficulty Progression**: Performance across easy/medium/hard levels
- **Question-Level Analysis**: Individual question performance tracking
- **Study Patterns**: Optimal study times and session lengths

### Real-time Insights
- **Learning Recommendations**: Personalized suggestions
- **Performance Trends**: Improvement/decline detection
- **Study Optimization**: Best practices based on data
- **Achievement Tracking**: Milestones and progress celebration

## 🔧 Integration with Existing Components

### Quiz Components
```typescript
import { useQuizAnalytics } from '@/lib/analytics-integration'

const { startQuizSession, endQuizSession, trackQuestionAttempt } = useQuizAnalytics()

// Start tracking when quiz begins
await startQuizSession(quizId, quizTitle)

// Track individual questions
await trackQuestionAttempt(attemptId, questionData)

// End tracking when quiz completes
await endQuizSession(score, timeSpent, answers)
```

### File Upload Components
```typescript
import { useFileAnalytics } from '@/lib/analytics-integration'

const { trackUpload, updateFileSubject } = useFileAnalytics()

// Track file upload
await trackUpload(fileId, fileName, fileType)

// Update subject classification
await updateFileSubject(fileId, detectedSubject)
```

### Study Guide Components
```typescript
import { useReviewerAnalytics } from '@/lib/analytics-integration'

const { trackGeneration } = useReviewerAnalytics()

// Track when study guide is generated
await trackGeneration(reviewerId, title)
```

## 📈 Analytics Features

### Dashboard Overview
- Key performance indicators
- Visual progress charts
- Recent activity summary
- Study streak display

### Performance Analysis
- Score trends over time
- Subject-wise breakdown
- Difficulty progression
- Time investment tracking

### Insights and Recommendations
- Personalized study suggestions
- Optimal study time analysis
- Weakness identification
- Strength reinforcement

### Data Export (Future Enhancement)
- CSV export of performance data
- Study session logs
- Progress reports
- Achievement certificates

## 🔄 Automatic Tracking

The system automatically tracks:
1. **Quiz Sessions**: Start time, duration, score, questions attempted
2. **File Uploads**: Upload time, file type, subject classification
3. **Study Activities**: General study sessions with duration
4. **Content Generation**: AI-generated content creation
5. **Daily Streaks**: Consecutive learning days with activity

## 🎛️ Configuration Options

### User Preferences
- Daily study time goals
- Preferred subjects
- Difficulty preferences
- Notification settings

### Analytics Settings
- Data retention periods
- Privacy controls
- Export options
- Sharing preferences

## 🐛 Troubleshooting

### Common Issues
1. **"Tables don't exist"**: Run the SQL migration script
2. **"No data showing"**: Complete the analytics setup
3. **"Permission denied"**: Check RLS policies are applied
4. **"Slow loading"**: Verify database indexes are created

### Debug Information
Check browser console for detailed error messages and ensure:
- User is authenticated
- Database migration completed
- RLS policies are active
- Indexes are created

## 🚦 Next Steps

### Immediate Actions
1. Run the database migration
2. Complete analytics setup
3. Test with some quiz attempts
4. Verify data appears in analytics page

### Future Enhancements
1. **Advanced Visualizations**: More chart types and interactive graphs
2. **Comparative Analytics**: Compare with peer performance
3. **Goal Setting**: Personal learning objectives tracking
4. **Achievements System**: Badges and milestone rewards
5. **Export Features**: Data export and sharing capabilities

## 📝 Files Created/Modified

### New Files
- `scripts/06-analytics-enhancement.sql` - Database migration
- `lib/analytics-data.ts` - Analytics data service (enhanced)
- `lib/study-session-tracker.ts` - Session tracking service
- `lib/analytics-integration.ts` - Integration hooks
- `lib/analytics-setup.ts` - Setup automation
- `components/analytics/analytics-setup.tsx` - Setup UI
- `app/analytics/setup/page.tsx` - Setup page

### Modified Files
- `app/analytics/page.tsx` - Enhanced with real data
- `lib/analytics-utils.ts` - Enhanced utility functions

The analytics system is now fully integrated and ready to provide comprehensive insights into your users' learning patterns and progress! 🎉