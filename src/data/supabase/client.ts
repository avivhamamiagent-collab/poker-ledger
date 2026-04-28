import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getEnv } from '../../config/env'

let _client: SupabaseClient | null = null

export function supabase(): SupabaseClient {
  if (_client) return _client
  const env = getEnv()
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
  }
  _client = createClient(env.supabaseUrl, env.supabaseAnonKey)
  return _client
}

