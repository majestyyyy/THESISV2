-- Enhanced Analytics Schema for Comprehensive User Tracking
-- Run this after your existing setup scripts

-- Add missing columns to existing tables
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS subject VARCHAR(100);
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS file_type VARCHAR(50);
ALTER TABLE public.files ADD COLUMN IF NOT EXISTS processing_time INTEGER; -- in seconds

ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS subject VARCHAR(100);
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'medium';
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS estimated_time INTEGER; -- in minutes

-- Create study sessions table for comprehensive time tracking
CREATE TABLE IF NOT EXISTS public.study_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL, -- 'quiz', 'upload', 'review', 'generate', 'study'
  resource_id UUID, -- ID of the related resource (quiz, file, reviewer, etc.)
  resource_name VARCHAR(255),
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}', -- Additional session data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create question-level performance tracking
CREATE TABLE IF NOT EXISTS public.question_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_attempt_id UUID REFERENCES public.quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  question_text TEXT,
  user_answer TEXT,
  correct_answer TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT FALSE,
  time_spent_seconds INTEGER DEFAULT 0,
  difficulty VARCHAR(20) DEFAULT 'medium',
  subject VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user preferences table for personalized analytics
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  preferred_subjects JSONB DEFAULT '[]',
  study_goals JSONB DEFAULT '{}',
  difficulty_preference VARCHAR(20) DEFAULT 'medium',
  daily_study_target INTEGER DEFAULT 30, -- minutes
  notification_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning streaks table for detailed tracking
CREATE TABLE IF NOT EXISTS public.learning_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  streak_date DATE NOT NULL,
  activities_count INTEGER DEFAULT 0,
  total_study_time INTEGER DEFAULT 0, -- in minutes
  quizzes_completed INTEGER DEFAULT 0,
  files_uploaded INTEGER DEFAULT 0,
  reviewers_generated INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, streak_date)
);

-- Enable RLS on new tables
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_streaks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for study_sessions
CREATE POLICY "Users can view own study sessions" ON public.study_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own study sessions" ON public.study_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own study sessions" ON public.study_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for question_attempts
CREATE POLICY "Users can view own question attempts" ON public.question_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts qa
      WHERE qa.id = question_attempts.quiz_attempt_id
      AND qa.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own question attempts" ON public.question_attempts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.quiz_attempts qa
      WHERE qa.id = question_attempts.quiz_attempt_id
      AND qa.user_id = auth.uid()
    )
  );

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for learning_streaks
CREATE POLICY "Users can view own learning streaks" ON public.learning_streaks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning streaks" ON public.learning_streaks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning streaks" ON public.learning_streaks
  FOR UPDATE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_activity_type ON public.study_sessions(activity_type);
CREATE INDEX IF NOT EXISTS idx_study_sessions_started_at ON public.study_sessions(started_at);

CREATE INDEX IF NOT EXISTS idx_question_attempts_quiz_attempt_id ON public.question_attempts(quiz_attempt_id);
CREATE INDEX IF NOT EXISTS idx_question_attempts_is_correct ON public.question_attempts(is_correct);

CREATE INDEX IF NOT EXISTS idx_learning_streaks_user_date ON public.learning_streaks(user_id, streak_date);

-- Create functions for automatic streak tracking
CREATE OR REPLACE FUNCTION public.update_learning_streak()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update today's streak record
  INSERT INTO public.learning_streaks (user_id, streak_date, activities_count, total_study_time)
  VALUES (
    NEW.user_id,
    CURRENT_DATE,
    1,
    COALESCE(NEW.duration_minutes, 0)
  )
  ON CONFLICT (user_id, streak_date)
  DO UPDATE SET
    activities_count = learning_streaks.activities_count + 1,
    total_study_time = learning_streaks.total_study_time + COALESCE(NEW.duration_minutes, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for study session tracking
DROP TRIGGER IF EXISTS update_learning_streak_trigger ON public.study_sessions;
CREATE TRIGGER update_learning_streak_trigger
  AFTER INSERT ON public.study_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_learning_streak();

-- Create function to automatically track quiz completion streaks
CREATE OR REPLACE FUNCTION public.update_quiz_streak()
RETURNS TRIGGER AS $$
BEGIN
  -- Update today's streak record for quiz completion
  INSERT INTO public.learning_streaks (user_id, streak_date, quizzes_completed)
  VALUES (NEW.user_id, CURRENT_DATE, 1)
  ON CONFLICT (user_id, streak_date)
  DO UPDATE SET
    quizzes_completed = learning_streaks.quizzes_completed + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for quiz attempt tracking
DROP TRIGGER IF EXISTS update_quiz_streak_trigger ON public.quiz_attempts;
CREATE TRIGGER update_quiz_streak_trigger
  AFTER INSERT ON public.quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quiz_streak();

-- Create view for easy analytics querying
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