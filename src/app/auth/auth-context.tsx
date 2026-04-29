import * as React from 'react'
import type { User } from '@supabase/supabase-js'
import { getEnv } from '../../config/env'
import { supabase } from '../../data/supabase/client'

type AuthState = {
  enabled: boolean
  user: User | null
  loading: boolean
  error?: string
}

const AuthContext = React.createContext<AuthState | null>(null)

export async function signUp(email: string, password: string, displayName: string) {
  const sb = supabase()
  const { data, error } = await sb.auth.signUp(
    {
      email,
      password,
      options: { data: { display_name: displayName } },
    },
  )
  if (error) throw error
  return data.user
}

export async function signIn(email: string, password: string) {
  const sb = supabase()
  const { data, error } = await sb.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function signOut() {
  const sb = supabase()
  await sb.auth.signOut()
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const env = getEnv()
  const hasSupabaseConfig = Boolean(env.supabaseUrl && env.supabaseAnonKey)
  const enabled = env.storage === 'supabase' && hasSupabaseConfig

  const [state, setState] = React.useState<AuthState>({
    enabled,
    user: null,
    loading: enabled,
  })

  React.useEffect(() => {
    if (!enabled) {
      setState((s) => ({ ...s, loading: false }))
      return
    }

    const sb = supabase()

    // Get initial session
    sb.auth
      .getSession()
      .then(({ data }) => {
        setState({ enabled, user: data.session?.user ?? null, loading: false })
      })
      .catch((e: unknown) => {
        setState({ enabled, user: null, loading: false, error: String(e) })
      })

    // Listen for auth changes
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({ ...prev, user: session?.user ?? null, loading: false }))
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  }, [enabled])

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
