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
  // Persist calls can happen rapidly (e.g. typing). Since our Supabase
  // persistence overwrites child tables, concurrent writes can race and cause
  // stale state to win. Serialize writes and make "latest call wins".
  const persistQueue = React.useRef(Promise.resolve())
  const persistVersion = React.useRef(0)

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
      const myVersion = ++persistVersion.current

      persistQueue.current = persistQueue.current
        .catch(() => {})
        .then(async () => {
          // If a newer persist() was scheduled, skip this write.
          if (myVersion !== persistVersion.current) return
          await store.putSession(next)
          // Only apply if still the newest.
          if (myVersion === persistVersion.current) setSession(next)
        })

      return persistQueue.current
    },
    [store],
  )

  return <SessionContext.Provider value={{ session, setSession, loading, error, refresh, persist }}>{children}</SessionContext.Provider>
}

export function useSessionContext(): SessionContextValue | null {
  return React.useContext(SessionContext)
}
