import { getEnv } from '../config/env'
import type { LedgerStore } from './store-types'
import { localStore } from './local-store'

export function createStore(): LedgerStore {
  const env = getEnv()
  if (env.storage === 'supabase' && env.supabaseUrl && env.supabaseAnonKey) {
    // Supabase store is available but not eagerly bundled;
    // fall back to local store for now.
    console.warn('[store] Supabase storage requested but not bundled; using local store.')
  }
  return localStore
}
