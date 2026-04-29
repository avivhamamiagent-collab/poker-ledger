import { getEnv } from '../config/env'
import type { LedgerStore } from './store-types'
import { localStore } from './local-store'

export function createStore(): LedgerStore {
  const env = getEnv()
  if (env.storage === 'supabase') {
    throw new Error('Supabase store is no longer eagerly bundled; initialize it through the dedicated provider path.')
  }
  return localStore
}
