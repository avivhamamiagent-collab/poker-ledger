import * as React from 'react'
import type { Session } from '../../../domain/types'
import { useStore } from '../../store-context'
import { useSessions } from '../../hooks/useSessions'

const SessionContext = React.createContext<Session | null>(null)

export function SessionProvider({ id, children }: { id: string; children: React.ReactNode }) {
  const store = useStore()
  const { sessions } = useSessions()
  const [session, setSession] = React.useState<Session | null>(null)

  React.useEffect(() => {
    store.getSession(id).then((s) => setSession(s ?? null))
  }, [id, store])

  // Sync when sessions update (e.g. after persist)
  React.useEffect(() => {
    const found = sessions.find((s) => s.id === id)
    if (found && found !== session) setSession(found)
  }, [sessions, id])

  return <SessionContext.Provider value={session}>{children}</SessionContext.Provider>
}

export function useSessionContext(): Session | null {
  return React.useContext(SessionContext)
}