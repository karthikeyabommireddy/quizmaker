export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'student'
export type QuizDifficulty = 'easy' | 'medium' | 'hard'
export type QuestionType = 'single_select' | 'multiple_select' | 'fill_blank' | 'true_false' | 'matching' | 'drag_drop' | 'short_answer' | 'matrix' | 'hotspot' | 'numerical'
export type QuestionDifficulty = 'easy' | 'medium' | 'hard'
export type FeedbackTiming = 'immediate' | 'after_submission' | 'at_end'
export type AttemptStatus = 'in_progress' | 'completed' | 'abandoned'
export type AnimationType = 'fade_in' | 'slide_left' | 'slide_right' | 'slide_top' | 'slide_bottom' | 'zoom' | 'bounce' | 'flip' | 'rotate'
export type EasingType = 'linear' | 'ease_in' | 'ease_out' | 'ease_in_out' | 'bounce' | 'back'

export interface Database {
  public: {
    Tables: {
      users_profile: {
        Row: {
          id: string
          user_id: string
          role: UserRole
          full_name: string
          avatar_url: string | null
          total_quizzes_taken: number
          total_score: number
          average_score: number
          badges_earned: number
          current_streak: number
          longest_streak: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role?: UserRole
          full_name: string
          avatar_url?: string | null
          total_quizzes_taken?: number
          total_score?: number
          average_score?: number
          badges_earned?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role?: UserRole
          full_name?: string
          avatar_url?: string | null
          total_quizzes_taken?: number
          total_score?: number
          average_score?: number
          badges_earned?: number
          current_streak?: number
          longest_streak?: number
          created_at?: string
          updated_at?: string
        }
      }
      quizzes: {
        Row: {
          id: string
          created_by: string | null
          title: string
          description: string | null
          difficulty: QuizDifficulty
          duration_minutes: number
          shuffle_questions: boolean
          shuffle_options: boolean
          show_feedback: FeedbackTiming
          allow_review: boolean
          allow_navigation: boolean
          passing_percentage: number
          max_attempts: number | null
          is_active: boolean
          is_archived: boolean
          total_questions: number
          total_marks: number
          category: string | null
          tags: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          created_by?: string | null
          title: string
          description?: string | null
          difficulty?: QuizDifficulty
          duration_minutes: number
          shuffle_questions?: boolean
          shuffle_options?: boolean
          show_feedback?: FeedbackTiming
          allow_review?: boolean
          allow_navigation?: boolean
          passing_percentage?: number
          max_attempts?: number | null
          is_active?: boolean
          is_archived?: boolean
          total_questions?: number
          total_marks?: number
          category?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_by?: string | null
          title?: string
          description?: string | null
          difficulty?: QuizDifficulty
          duration_minutes?: number
          shuffle_questions?: boolean
          shuffle_options?: boolean
          show_feedback?: FeedbackTiming
          allow_review?: boolean
          allow_navigation?: boolean
          passing_percentage?: number
          max_attempts?: number | null
          is_active?: boolean
          is_archived?: boolean
          total_questions?: number
          total_marks?: number
          category?: string | null
          tags?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          quiz_id: string
          question_type: QuestionType
          question_text: string
          question_image_url: string | null
          question_order: number
          marks: number
          time_limit_seconds: number | null
          difficulty: QuestionDifficulty
          allow_partial_marking: boolean
          negative_marking: number
          is_required: boolean
          tags: string[] | null
          explanation: string | null
          hint: string | null
          entrance_animation: AnimationType
          entrance_duration: number
          entrance_easing: EasingType
          exit_animation: AnimationType
          exit_duration: number
          delay_before_next: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          question_type: QuestionType
          question_text: string
          question_image_url?: string | null
          question_order: number
          marks?: number
          time_limit_seconds?: number | null
          difficulty?: QuestionDifficulty
          allow_partial_marking?: boolean
          negative_marking?: number
          is_required?: boolean
          tags?: string[] | null
          explanation?: string | null
          hint?: string | null
          entrance_animation?: AnimationType
          entrance_duration?: number
          entrance_easing?: EasingType
          exit_animation?: AnimationType
          exit_duration?: number
          delay_before_next?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          question_type?: QuestionType
          question_text?: string
          question_image_url?: string | null
          question_order?: number
          marks?: number
          time_limit_seconds?: number | null
          difficulty?: QuestionDifficulty
          allow_partial_marking?: boolean
          negative_marking?: number
          is_required?: boolean
          tags?: string[] | null
          explanation?: string | null
          hint?: string | null
          entrance_animation?: AnimationType
          entrance_duration?: number
          entrance_easing?: EasingType
          exit_animation?: AnimationType
          exit_duration?: number
          delay_before_next?: number
          created_at?: string
          updated_at?: string
        }
      }
      question_options: {
        Row: {
          id: string
          question_id: string
          option_text: string
          option_image_url: string | null
          is_correct: boolean
          option_order: number
          explanation: string | null
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          option_text: string
          option_image_url?: string | null
          is_correct?: boolean
          option_order: number
          explanation?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          option_text?: string
          option_image_url?: string | null
          is_correct?: boolean
          option_order?: number
          explanation?: string | null
          created_at?: string
        }
      }
      feedback_tiers: {
        Row: {
          id: string
          quiz_id: string
          tier_number: number
          time_percentage_min: number
          time_percentage_max: number
          message: string
          emoji: string | null
          animation_type: AnimationType
          color_code: string
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          tier_number: number
          time_percentage_min: number
          time_percentage_max: number
          message: string
          emoji?: string | null
          animation_type?: AnimationType
          color_code?: string
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          tier_number?: number
          time_percentage_min?: number
          time_percentage_max?: number
          message?: string
          emoji?: string | null
          animation_type?: AnimationType
          color_code?: string
          created_at?: string
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          quiz_id: string
          user_id: string
          attempt_number: number
          status: AttemptStatus
          score: number
          max_score: number
          percentage: number
          passed: boolean
          total_questions: number
          correct_answers: number
          wrong_answers: number
          partial_answers: number
          unattempted: number
          time_taken_seconds: number
          started_at: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          quiz_id: string
          user_id: string
          attempt_number: number
          status?: AttemptStatus
          score?: number
          max_score: number
          percentage?: number
          passed?: boolean
          total_questions: number
          correct_answers?: number
          wrong_answers?: number
          partial_answers?: number
          unattempted?: number
          time_taken_seconds?: number
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          quiz_id?: string
          user_id?: string
          attempt_number?: number
          status?: AttemptStatus
          score?: number
          max_score?: number
          percentage?: number
          passed?: boolean
          total_questions?: number
          correct_answers?: number
          wrong_answers?: number
          partial_answers?: number
          unattempted?: number
          time_taken_seconds?: number
          started_at?: string
          completed_at?: string | null
          created_at?: string
        }
      }
      student_responses: {
        Row: {
          id: string
          attempt_id: string
          question_id: string
          user_answer: string | null
          selected_options: string[] | null
          is_correct: boolean
          is_partial: boolean
          marks_awarded: number
          time_taken_seconds: number
          is_flagged: boolean
          feedback_tier: number | null
          answered_at: string
          created_at: string
        }
        Insert: {
          id?: string
          attempt_id: string
          question_id: string
          user_answer?: string | null
          selected_options?: string[] | null
          is_correct?: boolean
          is_partial?: boolean
          marks_awarded?: number
          time_taken_seconds?: number
          is_flagged?: boolean
          feedback_tier?: number | null
          answered_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          attempt_id?: string
          question_id?: string
          user_answer?: string | null
          selected_options?: string[] | null
          is_correct?: boolean
          is_partial?: boolean
          marks_awarded?: number
          time_taken_seconds?: number
          is_flagged?: boolean
          feedback_tier?: number | null
          answered_at?: string
          created_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string | null
          icon_url: string | null
          criteria: Json
          points: number
          rarity: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon_url?: string | null
          criteria: Json
          points?: number
          rarity?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon_url?: string | null
          criteria?: Json
          points?: number
          rarity?: string
          created_at?: string
        }
      }
      user_badges: {
        Row: {
          id: string
          user_id: string
          badge_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          user_id: string
          badge_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          badge_id?: string
          earned_at?: string
        }
      }
      audit_log: {
        Row: {
          id: string
          user_id: string | null
          action: string
          entity_type: string
          entity_id: string | null
          details: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      quiz_difficulty: QuizDifficulty
      question_type: QuestionType
      question_difficulty: QuestionDifficulty
      feedback_timing: FeedbackTiming
      attempt_status: AttemptStatus
      animation_type: AnimationType
      easing_type: EasingType
    }
  }
}
