import { getEnv } from '../config/env'
import type { LedgerStore } from './store-types'
import { supabaseStore } from './supabase/store'

export function createStore(): LedgerStore {
  const env = getEnv()
  if (env.supabaseUrl && env.supabaseAnonKey) {
    if (env.storage !== 'supabase') {
      console.warn('[store] VITE_STORAGE is not "supabase"; forcing Supabase mode')
    }
    return supabaseStore
  }

  throw new Error('Supabase is not configured. Set VITE_STORAGE=supabase and provide VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY.')
}
