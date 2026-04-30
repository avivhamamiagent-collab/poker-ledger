import * as React from 'react'
import type { Player } from '../../domain/types'
import { useStore } from '../store-context'
import { useRosterContext } from '../roster/roster-context'
import { formatError, isNotAuthenticatedError } from '../../lib/errors'
import { useLocation, useNavigate } from 'react-router-dom'

export function useRoster() {
  // Hooks must be called unconditionally.
  const store = useStore()
  const ctx = useRosterContext()
  const nav = useNavigate()
  const location = useLocation()

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
      if (isNotAuthenticatedError(e)) {
        nav('/login', { replace: true, state: { from: location.pathname } })
        return
      }
      setError(formatError(e) || 'לא הצלחנו לטעון שחקנים')
    } finally {
      setLoading(false)
    }
  }, [ctx, store, nav, location.pathname])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  return ctx ?? { roster, setRoster, loading, error, refresh }
}
