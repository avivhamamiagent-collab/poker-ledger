import * as React from 'react'
import type { Session } from '../../domain/types'
import { useStore } from '../store-context'

export function useSessions() {
  const store = useStore()
  const [sessions, setSessions] = React.useState<Session[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSessions(await store.listSessions())
    } catch (e: any) {
      setError(e?.message || 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [store])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  return { sessions, setSessions, loading, error, refresh }
}

