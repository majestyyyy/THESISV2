-- Enhanced analytics tables for question type performance tracking
-- This script adds tables to track cumulative question type performance across all quizzes

-- Table to store question type performance for individual quizzes
CREATE TABLE IF NOT EXISTS quiz_question_type_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES quizzes(id) ON DELETE CASCADE,
  question_type VARCHAR(50) NOT NULL, -- multiple_choice, true_false, identification, etc.
  correct_answers INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  quiz_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to store cumulative question type performance across all quizzes
CREATE TABLE IF NOT EXISTS cumulative_question_type_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  question_type VARCHAR(50) NOT NULL,
  total_correct INTEGER NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  total_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
  quiz_count INTEGER NOT NULL DEFAULT 0, -- Number of quizzes with this question type
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, question_type) -- One record per user per question type
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_question_type_performance_user_id ON quiz_question_type_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_question_type_performance_quiz_id ON quiz_question_type_performance(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_question_type_performance_question_type ON quiz_question_type_performance(question_type);
CREATE INDEX IF NOT EXISTS idx_quiz_question_type_performance_quiz_date ON quiz_question_type_performance(quiz_date);

CREATE INDEX IF NOT EXISTS idx_cumulative_question_type_performance_user_id ON cumulative_question_type_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_cumulative_question_type_performance_question_type ON cumulative_question_type_performance(question_type);
CREATE INDEX IF NOT EXISTS idx_cumulative_question_type_performance_user_type ON cumulative_question_type_performance(user_id, question_type);

-- Add Row Level Security (RLS) policies
ALTER TABLE quiz_question_type_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE cumulative_question_type_performance ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own question type performance data
CREATE POLICY "Users can view own question type performance" ON quiz_question_type_performance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own question type performance" ON quiz_question_type_performance
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own cumulative performance" ON cumulative_question_type_performance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cumulative performance" ON cumulative_question_type_performance
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cumulative performance" ON cumulative_question_type_performance
    FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Optional: Add trigger to automatically update the last_updated timestamp
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cumulative_performance_last_updated
    BEFORE UPDATE ON cumulative_question_type_performance
    FOR EACH ROW
    EXECUTE FUNCTION update_last_updated_column();