import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Subject {
  id: string
  user_id: string
  name: string
  class_name: string
  subject_name: string
  board: string
  webhook_url: string
  emoji: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  subject_id: string
  user_id: string
  content: string
  type: 'sent' | 'received'
  created_at: string
}
