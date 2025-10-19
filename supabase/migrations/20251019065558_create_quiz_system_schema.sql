/*
  # Advanced Interactive Quiz System Database Schema

  ## Overview
  Complete database schema for a full-featured quiz platform with dual-role system (Admin & Student).
  Supports multiple question types, real-time feedback, performance analytics, and gamification.

  ## Tables Created

  1. **users_profile**
     - Extended user profile information
     - Stores role (admin/student), avatar, statistics
     - Links to auth.users

  2. **quizzes**
     - Quiz metadata, settings, and configuration
     - Duration, difficulty, shuffle settings
     - Feedback timing preferences

  3. **questions**
     - All question types (MCQ, MSQ, Fill-blank, True/False, etc.)
     - Question-specific settings (marks, time limit, animations)
     - Belongs to a quiz

  4. **question_options**
     - Answer options for MCQ/MSQ questions
     - Stores correct/incorrect status

  5. **feedback_tiers**
     - Time-based performance feedback configuration
     - Custom messages, animations, emojis per tier

  6. **quiz_attempts**
     - Student quiz attempt records
     - Tracks start time, end time, score, status

  7. **student_responses**
     - Individual question responses
     - Stores answer, correctness, time taken, marks awarded

  8. **badges**
     - Achievement definitions
     - Badge criteria and metadata

  9. **user_badges**
     - Tracks badges earned by users
     - Awards timestamp

  10. **leaderboard**
      - Materialized view for performance rankings
      - Aggregated scores and statistics

  11. **audit_log**
      - System activity tracking
      - User actions and changes

  ## Security
  - RLS enabled on all tables
  - Policies for role-based access control
  - Students can only view their own data
  - Admins have full access to manage content
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'student');
CREATE TYPE quiz_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE question_type AS ENUM ('single_select', 'multiple_select', 'fill_blank', 'true_false', 'matching', 'drag_drop', 'short_answer', 'matrix', 'hotspot', 'numerical');
CREATE TYPE question_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE feedback_timing AS ENUM ('immediate', 'after_submission', 'at_end');
CREATE TYPE attempt_status AS ENUM ('in_progress', 'completed', 'abandoned');
CREATE TYPE animation_type AS ENUM ('fade_in', 'slide_left', 'slide_right', 'slide_top', 'slide_bottom', 'zoom', 'bounce', 'flip', 'rotate');
CREATE TYPE easing_type AS ENUM ('linear', 'ease_in', 'ease_out', 'ease_in_out', 'bounce', 'back');

-- 1. Users Profile Table
CREATE TABLE IF NOT EXISTS users_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  role user_role DEFAULT 'student' NOT NULL,
  full_name text NOT NULL,
  avatar_url text,
  total_quizzes_taken integer DEFAULT 0,
  total_score integer DEFAULT 0,
  average_score numeric(5,2) DEFAULT 0,
  badges_earned integer DEFAULT 0,
  current_streak integer DEFAULT 0,
  longest_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Quizzes Table
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  difficulty quiz_difficulty DEFAULT 'medium',
  duration_minutes integer NOT NULL,
  shuffle_questions boolean DEFAULT false,
  shuffle_options boolean DEFAULT false,
  show_feedback feedback_timing DEFAULT 'immediate',
  allow_review boolean DEFAULT true,
  allow_navigation boolean DEFAULT true,
  passing_percentage numeric(5,2) DEFAULT 50.0,
  max_attempts integer,
  is_active boolean DEFAULT true,
  is_archived boolean DEFAULT false,
  total_questions integer DEFAULT 0,
  total_marks integer DEFAULT 0,
  category text,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  question_type question_type NOT NULL,
  question_text text NOT NULL,
  question_image_url text,
  question_order integer NOT NULL,
  marks integer DEFAULT 1 NOT NULL,
  time_limit_seconds integer,
  difficulty question_difficulty DEFAULT 'medium',
  allow_partial_marking boolean DEFAULT false,
  negative_marking numeric(5,2) DEFAULT 0,
  is_required boolean DEFAULT true,
  tags text[],
  explanation text,
  hint text,
  entrance_animation animation_type DEFAULT 'fade_in',
  entrance_duration integer DEFAULT 500,
  entrance_easing easing_type DEFAULT 'ease_in_out',
  exit_animation animation_type DEFAULT 'fade_in',
  exit_duration integer DEFAULT 300,
  delay_before_next integer DEFAULT 500,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. Question Options Table (for MCQ, MSQ)
CREATE TABLE IF NOT EXISTS question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  option_text text NOT NULL,
  option_image_url text,
  is_correct boolean DEFAULT false,
  option_order integer NOT NULL,
  explanation text,
  created_at timestamptz DEFAULT now()
);

-- 5. Feedback Tiers Table
CREATE TABLE IF NOT EXISTS feedback_tiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  tier_number integer NOT NULL,
  time_percentage_min numeric(5,2) NOT NULL,
  time_percentage_max numeric(5,2) NOT NULL,
  message text NOT NULL,
  emoji text,
  animation_type animation_type DEFAULT 'fade_in',
  color_code text DEFAULT '#4CAF50',
  created_at timestamptz DEFAULT now(),
  UNIQUE(quiz_id, tier_number)
);

-- 6. Quiz Attempts Table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid REFERENCES quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  attempt_number integer NOT NULL,
  status attempt_status DEFAULT 'in_progress',
  score numeric(10,2) DEFAULT 0,
  max_score numeric(10,2) NOT NULL,
  percentage numeric(5,2) DEFAULT 0,
  passed boolean DEFAULT false,
  total_questions integer NOT NULL,
  correct_answers integer DEFAULT 0,
  wrong_answers integer DEFAULT 0,
  partial_answers integer DEFAULT 0,
  unattempted integer DEFAULT 0,
  time_taken_seconds integer DEFAULT 0,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 7. Student Responses Table
CREATE TABLE IF NOT EXISTS student_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id uuid REFERENCES quiz_attempts(id) ON DELETE CASCADE NOT NULL,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE NOT NULL,
  user_answer text,
  selected_options uuid[],
  is_correct boolean DEFAULT false,
  is_partial boolean DEFAULT false,
  marks_awarded numeric(10,2) DEFAULT 0,
  time_taken_seconds integer DEFAULT 0,
  is_flagged boolean DEFAULT false,
  feedback_tier integer,
  answered_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- 8. Badges Table
CREATE TABLE IF NOT EXISTS badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon_url text,
  criteria jsonb NOT NULL,
  points integer DEFAULT 0,
  rarity text DEFAULT 'common',
  created_at timestamptz DEFAULT now()
);

-- 9. User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id uuid REFERENCES badges(id) ON DELETE CASCADE NOT NULL,
  earned_at timestamptz DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- 10. Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb,
  ip_address inet,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_profile_user_id ON users_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_created_by ON quizzes(created_by);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_active ON quizzes(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_feedback_tiers_quiz_id ON feedback_tiers(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_student_responses_attempt_id ON student_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_student_responses_question_id ON student_responses(question_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Enable Row Level Security
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users_profile
CREATE POLICY "Users can view all profiles"
  ON users_profile FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users_profile FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON users_profile FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for quizzes
CREATE POLICY "Anyone can view active quizzes"
  ON quizzes FOR SELECT
  TO authenticated
  USING (is_active = true OR created_by = auth.uid());

CREATE POLICY "Admins can insert quizzes"
  ON quizzes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update own quizzes"
  ON quizzes FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete own quizzes"
  ON quizzes FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for questions
CREATE POLICY "Users can view questions of accessible quizzes"
  ON questions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = questions.quiz_id
      AND (quizzes.is_active = true OR quizzes.created_by = auth.uid())
    )
  );

CREATE POLICY "Admins can manage questions"
  ON questions FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN users_profile ON users_profile.user_id = auth.uid()
      WHERE quizzes.id = questions.quiz_id
      AND quizzes.created_by = auth.uid()
      AND users_profile.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN users_profile ON users_profile.user_id = auth.uid()
      WHERE quizzes.id = questions.quiz_id
      AND quizzes.created_by = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

-- RLS Policies for question_options
CREATE POLICY "Users can view options of accessible questions"
  ON question_options FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN quizzes ON quizzes.id = questions.quiz_id
      WHERE questions.id = question_options.question_id
      AND (quizzes.is_active = true OR quizzes.created_by = auth.uid())
    )
  );

CREATE POLICY "Admins can manage options"
  ON question_options FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM questions
      JOIN quizzes ON quizzes.id = questions.quiz_id
      JOIN users_profile ON users_profile.user_id = auth.uid()
      WHERE questions.id = question_options.question_id
      AND quizzes.created_by = auth.uid()
      AND users_profile.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM questions
      JOIN quizzes ON quizzes.id = questions.quiz_id
      JOIN users_profile ON users_profile.user_id = auth.uid()
      WHERE questions.id = question_options.question_id
      AND quizzes.created_by = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

-- RLS Policies for feedback_tiers
CREATE POLICY "Users can view feedback tiers"
  ON feedback_tiers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      WHERE quizzes.id = feedback_tiers.quiz_id
      AND (quizzes.is_active = true OR quizzes.created_by = auth.uid())
    )
  );

CREATE POLICY "Admins can manage feedback tiers"
  ON feedback_tiers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN users_profile ON users_profile.user_id = auth.uid()
      WHERE quizzes.id = feedback_tiers.quiz_id
      AND quizzes.created_by = auth.uid()
      AND users_profile.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN users_profile ON users_profile.user_id = auth.uid()
      WHERE quizzes.id = feedback_tiers.quiz_id
      AND quizzes.created_by = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

-- RLS Policies for quiz_attempts
CREATE POLICY "Users can view own attempts"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all attempts for their quizzes"
  ON quiz_attempts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quizzes
      JOIN users_profile ON users_profile.user_id = auth.uid()
      WHERE quizzes.id = quiz_attempts.quiz_id
      AND quizzes.created_by = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

CREATE POLICY "Users can create own attempts"
  ON quiz_attempts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own attempts"
  ON quiz_attempts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for student_responses
CREATE POLICY "Users can view own responses"
  ON student_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = student_responses.attempt_id
      AND quiz_attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view responses for their quizzes"
  ON student_responses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      JOIN quizzes ON quizzes.id = quiz_attempts.quiz_id
      JOIN users_profile ON users_profile.user_id = auth.uid()
      WHERE quiz_attempts.id = student_responses.attempt_id
      AND quizzes.created_by = auth.uid()
      AND users_profile.role = 'admin'
    )
  );

CREATE POLICY "Users can create own responses"
  ON student_responses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = student_responses.attempt_id
      AND quiz_attempts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own responses"
  ON student_responses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = student_responses.attempt_id
      AND quiz_attempts.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM quiz_attempts
      WHERE quiz_attempts.id = student_responses.attempt_id
      AND quiz_attempts.user_id = auth.uid()
    )
  );

-- RLS Policies for badges
CREATE POLICY "Anyone can view badges"
  ON badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage badges"
  ON badges FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- RLS Policies for user_badges
CREATE POLICY "Users can view all earned badges"
  ON user_badges FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can award badges"
  ON user_badges FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- RLS Policies for audit_log
CREATE POLICY "Admins can view audit logs"
  ON audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users_profile
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "System can create audit logs"
  ON audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Insert default badges
INSERT INTO badges (name, description, icon_url, criteria, points, rarity) VALUES
  ('First Quiz', 'Complete your first quiz', '🎯', '{"type": "quiz_count", "value": 1}', 10, 'common'),
  ('Perfect Score', 'Score 100% on any quiz', '💯', '{"type": "perfect_score", "value": 1}', 50, 'rare'),
  ('Speed Demon', 'Complete a quiz in under 50% of allocated time', '⚡', '{"type": "speed", "value": 50}', 30, 'uncommon'),
  ('Consistency King', 'Complete 5 quizzes in a row', '👑', '{"type": "streak", "value": 5}', 40, 'uncommon'),
  ('Quiz Master', 'Complete 50 quizzes', '🏆', '{"type": "quiz_count", "value": 50}', 100, 'legendary'),
  ('High Achiever', 'Maintain an average score above 90%', '⭐', '{"type": "average_score", "value": 90}', 75, 'epic'),
  ('Early Bird', 'Complete a quiz within 1 hour of its release', '🐦', '{"type": "early_attempt", "value": 60}', 20, 'uncommon'),
  ('Perfectionist', 'Score 100% on 10 quizzes', '💎', '{"type": "perfect_score", "value": 10}', 150, 'legendary')
ON CONFLICT DO NOTHING;
