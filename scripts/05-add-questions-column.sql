-- Add questions column to quizzes table for storing JSON questions
-- This allows storing all question data in a single column for easier retrieval

ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS questions JSONB;

-- Update the difficulty_level column name to match our TypeScript interface
ALTER TABLE quizzes RENAME COLUMN difficulty_level TO difficulty;

-- Add index on questions column for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_questions ON quizzes USING gin(questions);

-- Update existing quizzes to populate questions column from quiz_questions table
-- (This would be run if there's existing data)
UPDATE quizzes 
SET questions = (
  SELECT json_agg(
    json_build_object(
      'id', qq.id::text,
      'questionText', qq.question_text,
      'questionType', qq.question_type,
      'options', CASE 
        WHEN qq.options IS NOT NULL THEN qq.options
        ELSE NULL
      END,
      'correctAnswer', qq.correct_answer,
      'explanation', qq.explanation,
      'difficulty', 'medium'
    )
    ORDER BY qq.question_order
  )
  FROM quiz_questions qq 
  WHERE qq.quiz_id = quizzes.id
)
WHERE questions IS NULL;
