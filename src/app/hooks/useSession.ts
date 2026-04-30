import * as React from 'react'
import { useParams } from 'react-router-dom'
import type { Session } from '../../domain/types'
import { useStore } from '../store-context'
import { useSessionContext } from '../pages/session/session-context'

export function useSession() {
  const { id } = useParams()

  // Hooks must be called unconditionally.
  const store = useStore()
  const ctx = useSessionContext()

  // Otherwise, fall back to direct loading
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    // If we're inside a SessionProvider (SessionLayout level), let context own it.
    if (ctx !== null) return
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
  }, [ctx, id, store])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  const persist = React.useCallback(
    async (next: Session) => {
      // If context exists, it should handle persistence.
      if (ctx !== null) return
      await store.putSession(next)
      setSession(next)
    },
    [ctx, store],
  )

  return ctx !== null ? { id, ...ctx } : { id, session, setSession, loading, error, refresh, persist }
}
