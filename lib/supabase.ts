import { createClient } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

const supabaseUrl = "https://lkmbonrfewhmtxtuqqrf.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrbWJvbnJmZXdobXR4dHVxcXJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5ODUxMzUsImV4cCI6MjA3MDU2MTEzNX0.ZfzyzVhWqVaYphP1yNLImdkFMjz4QX7nYl2zoxuJQEk"

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Server-side Supabase client
export function createServerSupabaseClient() {
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          email_confirmed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          email: string
          first_name: string
          last_name: string
          email_confirmed?: boolean
        }
        Update: {
          email?: string
          first_name?: string
          last_name?: string
          email_confirmed?: boolean
          updated_at?: string
        }
      }
      files: {
        Row: {
          id: string
          user_id: string
          filename: string
          original_name: string
          file_type: string
          file_size: number
          content_text: string | null
          upload_date: string
        }
        Insert: {
          user_id: string
          filename: string
          original_name: string
          file_type: string
          file_size: number
          content_text?: string | null
        }
        Update: {
          filename?: string
          original_name?: string
          file_type?: string
          file_size?: number
          content_text?: string | null
        }
      }
      quizzes: {
        Row: {
          id: string
          user_id: string
          file_id: string
          title: string
          description: string | null
          difficulty_level: string
          total_questions: number
          created_at: string
        }
        Insert: {
          user_id: string
          file_id: string
          title: string
          description?: string | null
          difficulty_level?: string
          total_questions: number
        }
        Update: {
          title?: string
          description?: string | null
          difficulty_level?: string
          total_questions?: number
        }
      }
      quiz_questions: {
        Row: {
          id: string
          quiz_id: string
          question_text: string
          question_type: string
          options: any
          correct_answer: string
          explanation: string | null
          question_order: number
        }
        Insert: {
          quiz_id: string
          question_text: string
          question_type?: string
          options?: any
          correct_answer: string
          explanation?: string | null
          question_order: number
        }
        Update: {
          question_text?: string
          question_type?: string
          options?: any
          correct_answer?: string
          explanation?: string | null
          question_order?: number
        }
      }
      quiz_attempts: {
        Row: {
          id: string
          user_id: string
          quiz_id: string
          score: number
          total_questions: number
          time_taken: number | null
          answers: any
          completed_at: string
        }
        Insert: {
          user_id: string
          quiz_id: string
          score: number
          total_questions: number
          time_taken?: number | null
          answers?: any
        }
        Update: {
          score?: number
          total_questions?: number
          time_taken?: number | null
          answers?: any
        }
      }
      reviewers: {
        Row: {
          id: string
          user_id: string
          file_id: string
          title: string
          content: string
          reviewer_type: string
          created_at: string
        }
        Insert: {
          user_id: string
          file_id: string
          title: string
          content: string
          reviewer_type?: string
        }
        Update: {
          title?: string
          content?: string
          reviewer_type?: string
        }
      }
      analytics: {
        Row: {
          id: string
          user_id: string
          action_type: string
          resource_id: string | null
          metadata: any
          created_at: string
        }
        Insert: {
          user_id: string
          action_type: string
          resource_id?: string | null
          metadata?: any
        }
        Update: {
          action_type?: string
          resource_id?: string | null
          metadata?: any
        }
      }
    }
  }
}
