import { createClient } from '@supabase/supabase-js'

// Create a function to get the Supabase client with proper error handling
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    // During build time or when env vars are missing, return a mock client
    // This prevents build-time errors while still allowing the code to compile
    console.warn('Supabase environment variables not found. Using mock client.')
    return createClient('https://mock.supabase.co', 'mock-anon-key')
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

// Export a lazy-initialized client
export const supabase = createSupabaseClient()


