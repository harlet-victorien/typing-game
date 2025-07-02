import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Main Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      scores: {
        Row: {
          id: string
          user_id: string
          wpm: number
          accuracy: number
          words_typed: number
          errors: number
          time_duration: number
          created_at: string
          user_email?: string
        }
        Insert: {
          id?: string
          user_id: string
          wpm: number
          accuracy: number
          words_typed: number
          errors: number
          time_duration: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          wpm?: number
          accuracy?: number
          words_typed?: number
          errors?: number
          time_duration?: number
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          username?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
    }
  }
}

export type Score = Database['public']['Tables']['scores']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row'] 