-- Database schema compatibility fixes
-- Run this if you encounter column naming issues

-- Update the analytics view to use correct column names
CREATE OR REPLACE VIEW public.user_analytics_summary AS
SELECT 
  u.id as user_id,
  u.email,
  
  -- Basic counts
  COUNT(DISTINCT f.id) as files_uploaded,
  COUNT(DISTINCT r.id) as reviewers_generated,
  COUNT(DISTINCT q.id) as quizzes_created,
  COUNT(DISTINCT qa.id) as quiz_attempts,
  
  -- Performance metrics
  COALESCE(AVG(qa.score), 0) as average_score,
  COALESCE(SUM(qa.time_taken), 0) / 60 as total_study_time_minutes,
  
  -- Recent activity
  MAX(f.upload_date) as last_file_upload,
  MAX(qa.completed_at) as last_quiz_attempt,
  MAX(r.created_at) as last_reviewer_generated,
  
  -- Streak information
  COALESCE(MAX(ls.streak_date), '1970-01-01'::date) as last_active_date
  
FROM public.users u
LEFT JOIN public.files f ON u.id = f.user_id
LEFT JOIN public.reviewers r ON u.id = r.user_id
LEFT JOIN public.quizzes q ON u.id = q.user_id
LEFT JOIN public.quiz_attempts qa ON u.id = qa.user_id
LEFT JOIN public.learning_streaks ls ON u.id = ls.user_id
GROUP BY u.id, u.email;

-- Grant necessary permissions
GRANT SELECT ON public.user_analytics_summary TO authenticated;

-- Add indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_files_upload_date ON public.files(upload_date);
CREATE INDEX IF NOT EXISTS idx_files_user_id_upload_date ON public.files(user_id, upload_date);