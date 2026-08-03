import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Book = {
  id: string
  user_id: string
  title: string
  author: string
  kind: string
  genre: string
  status: string
  date_finished: string | null
  rating: number
  synopsis: string
  quotes: string[]
  goodreads_url?: string | null
  created_at: number
}

export type CustomStatus = {
  user_id: string
  status_id: string
  label: string
  created_at: number
}
