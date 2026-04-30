import * as React from 'react'
import type { Player } from '../../domain/types'
import { useStore } from '../store-context'
import { useRosterContext } from '../roster/roster-context'

export function useRoster() {
  // Hooks must be called unconditionally.
  const store = useStore()
  const ctx = useRosterContext()

  // Otherwise, fall back to direct loading (standalone pages)
  const [roster, setRoster] = React.useState<Player[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    // If we're inside a RosterProvider (AppShell level), let context own it.
    if (ctx !== null) return

    setLoading(true)
    setError(null)
    try {
      setRoster(await store.listPlayers())
    } catch (e: any) {
      setError(e?.message || 'Failed to load roster')
    } finally {
      setLoading(false)
    }
  }, [ctx, store])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  return ctx ?? { roster, setRoster, loading, error, refresh }
}
