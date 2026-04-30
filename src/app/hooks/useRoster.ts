import * as React from 'react'
import type { Player } from '../../domain/types'
import { useStore } from '../store-context'
import { useRosterContext } from '../roster/roster-context'

export function useRoster() {
  const store = useStore()

  // If we're inside a RosterProvider (AppShell level), use the shared context
  const ctx = useRosterContext()
  if (ctx !== null) {
    return ctx
  }

  // Otherwise, fall back to direct loading (standalone pages)
  const [roster, setRoster] = React.useState<Player[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setRoster(await store.listPlayers())
    } catch (e: any) {
      setError(e?.message || 'Failed to load roster')
    } finally {
      setLoading(false)
    }
  }, [store])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  return { roster, setRoster, loading, error, refresh }
}
