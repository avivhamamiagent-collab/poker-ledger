import * as React from 'react'
import type { Player } from '../../domain/types'
import { useStore } from '../store-context'

type RosterContextValue = {
  roster: Player[]
  setRoster: React.Dispatch<React.SetStateAction<Player[]>>
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const RosterContext = React.createContext<RosterContextValue | null>(null)

export function RosterProvider({ children }: { children: React.ReactNode }) {
  const store = useStore()
  const [roster, setRoster] = React.useState<Player[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const next = await store.listPlayers()
      setRoster(next)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'לא הצלחנו לטעון שחקנים')
    } finally {
      setLoading(false)
    }
  }, [store])

  React.useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

  return <RosterContext.Provider value={{ roster, setRoster, loading, error, refresh }}>{children}</RosterContext.Provider>
}

export function useRosterContext(): RosterContextValue | null {
  return React.useContext(RosterContext)
}

export { RosterContext }
