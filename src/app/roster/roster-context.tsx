import * as React from 'react'
import type { Player } from '../../domain/types'
import { useStore } from '../store-context'

const RosterContext = React.createContext<Player[]>([])

export function RosterProvider({ children }: { children: React.ReactNode }) {
  const store = useStore()
  const [roster, setRoster] = React.useState<Player[]>([])

  React.useEffect(() => {
    store.listPlayers().then(setRoster)
  }, [store])

  return <RosterContext.Provider value={roster}>{children}</RosterContext.Provider>
}

export function useRosterContext(): Player[] {
  return React.useContext(RosterContext)
}

export { RosterContext }