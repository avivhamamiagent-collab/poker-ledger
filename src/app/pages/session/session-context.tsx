import * as React from 'react'
import type { Session } from '../../../domain/types'
import { useStore } from '../../store-context'

type SessionContextValue = {
  session: Session | null
  setSession: React.Dispatch<React.SetStateAction<Session | null>>
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  persist: (next: Session) => Promise<void>
}

const SessionContext = React.createContext<SessionContextValue | null>(null)

export function SessionProvider({ id, children }: { id: string; children: React.ReactNode }) {
  const store = useStore()
  const [session, setSession] = React.useState<Session | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const s = await store.getSession(id)
      setSession(s ?? null)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'לא הצלחנו לטעון שולחן')
      setSession(null)
    } finally {
      setLoading(false)
    }
  }, [id, store])

  React.useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

  const persist = React.useCallback(
    async (next: Session) => {
      await store.putSession(next)
      setSession(next)
    },
    [store],
  )

  return <SessionContext.Provider value={{ session, setSession, loading, error, refresh, persist }}>{children}</SessionContext.Provider>
}

export function useSessionContext(): SessionContextValue | null {
  return React.useContext(SessionContext)
}
