import * as React from 'react'
import { useParams } from 'react-router-dom'
import type { Session } from '../../domain/types'
import { useStore } from '../store-context'
import { useSessionContext } from '../pages/session/session-context'

export function useSession() {
  const { id } = useParams()
  const store = useStore()
  const ctx = useSessionContext()
  const inProvider = ctx !== null

  // If we're inside a SessionProvider (SessionLayout level), use the shared context
  if (inProvider) {
    return {
      id,
      session: ctx,
      setSession: () => {},
      loading: false,
      error: null,
      refresh: () => Promise.resolve(),
      persist: async (_next: Session) => {},
    }
  }

  // Otherwise, fall back to direct loading
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const s = await store.getSession(id)
      setSession(s || null)
    } catch (e: any) {
      setError(e?.message || 'Failed to load session')
      setSession(null)
    } finally {
      setLoading(false)
    }
  }, [id, store])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  const persist = React.useCallback(
    async (next: Session) => {
      await store.putSession(next)
      setSession(next)
    },
    [store],
  )

  return { id, session, setSession, loading, error, refresh, persist }
}