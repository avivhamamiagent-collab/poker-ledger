import type { StorageKind } from '../data/store-types'

export type AppEnv = {
  storage: StorageKind
  supabaseUrl?: string
  supabaseAnonKey?: string
  enableSupabaseAuth: boolean
  webPushPublicKey?: string
}

function asBool(v: string | undefined): boolean {
  return v === '1' || v === 'true' || v === 'yes'
}

export function getEnv(): AppEnv {
  const storage = (import.meta.env.VITE_STORAGE as StorageKind | undefined) || 'local'
  return {
    storage,
    supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string | undefined,
    supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined,
    enableSupabaseAuth: asBool(import.meta.env.VITE_ENABLE_SUPABASE_AUTH as string | undefined),
    webPushPublicKey: import.meta.env.VITE_WEB_PUSH_PUBLIC_KEY as string | undefined,
  }
}

