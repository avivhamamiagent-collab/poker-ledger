import { getEnv } from '../config/env'
import type { LedgerStore } from './store-types'
import { localStore } from './local-store'
import { supabaseStore } from './supabase/store'

export function createStore(): LedgerStore {
  const env = getEnv()
  if (env.storage === 'supabase' && env.supabaseUrl && env.supabaseAnonKey) {
    console.info('[store] Using Supabase store')
    return supabaseStore
  }
  return localStore
}
