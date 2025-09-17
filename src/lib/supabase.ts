import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          display_name: string | null
          avatar_url: string | null
          email: string | null
          role: string | null
        }
        Insert: {
          id: string
          updated_at?: string | null
          display_name?: string | null
          avatar_url?: string | null
          email?: string | null
          role?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          display_name?: string | null
          avatar_url?: string | null
          email?: string | null
          role?: string | null
        }
      }
      messages: {
        Row: {
          id: number
          created_at: string
          sender_id: string
          receiver_id: string
          content: string
          message_type: string | null
          read_at: string | null
        }
        Insert: {
          id?: number
          created_at?: string
          sender_id: string
          receiver_id: string
          content: string
          message_type?: string | null
          read_at?: string | null
        }
        Update: {
          id?: number
          created_at?: string
          sender_id?: string
          receiver_id?: string
          content?: string
          message_type?: string | null
          read_at?: string | null
        }
      }
    }
  }
}
