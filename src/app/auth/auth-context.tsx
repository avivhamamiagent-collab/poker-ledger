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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const env = getEnv()
  const enabled = env.storage === 'supabase' && env.enableSupabaseAuth

  const [state, setState] = React.useState<AuthState>({ enabled, user: null, loading: enabled })

  React.useEffect(() => {
    if (!enabled) {
      setState({ enabled, user: null, loading: false })
      return
    }

    const sb = supabase()

    let cancelled = false

    sb.auth
      .getSession()
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          setState({ enabled, user: null, loading: false, error: error.message })
          return
        }
        setState({ enabled, user: data.session?.user ?? null, loading: false })
      })
      .catch((e: any) => {
        if (cancelled) return
        setState({ enabled, user: null, loading: false, error: String(e?.message ?? e) })
      })

    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({ ...prev, user: session?.user ?? null }))
    })

    return () => {
      cancelled = true
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
