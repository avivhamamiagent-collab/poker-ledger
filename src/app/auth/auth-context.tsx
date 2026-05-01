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
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  })
  if (error) throw error
  // If email confirmation is enabled, data.session is null and data.user may be
  // a partial object. Return null so callers can detect the pending-confirmation case.
  if (!data.session) return null

  // Profile is auto-created by `on_auth_user_created` trigger.
  // Best-effort: create a default roster player so the user can start a session immediately.
  if (data.user) {
    try {
      await sb.from('players').insert({ user_id: data.user.id, name: displayName || email.split('@')[0] })
    } catch {
      // non-blocking: roster page lets the user add players later
    }
  }
  return data.user
}

export async function requestPasswordReset(email: string) {
  const sb = supabase()
  const redirectTo = `${window.location.origin}/reset-password`
  const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw error
}

export async function updatePassword(newPassword: string) {
  const sb = supabase()
  const { error } = await sb.auth.updateUser({ password: newPassword })
  if (error) throw error
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
  const enabled = hasSupabaseConfig

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
