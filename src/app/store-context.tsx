import * as React from 'react'
import type { LedgerStore } from '../data/store-types'
import { createStore } from '../data/store'

const StoreContext = React.createContext<LedgerStore | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [{ store, error }] = React.useState(() => {
    try {
      return { store: createStore(), error: null as string | null }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      return { store: null as LedgerStore | null, error: message }
    }
  })

  if (!store) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background px-6 text-on-background">
        <div className="w-full max-w-xl rounded-2xl border border-red-400/20 bg-red-500/10 p-5">
          <h1 className="text-xl font-black text-red-100">שגיאת הגדרות מערכת</h1>
          <p className="mt-2 text-sm leading-6 text-red-100/90">
            האפליקציה מוגדרת לעבוד עם Supabase בלבד. צריך להגדיר משתני סביבה תקינים לפני הפעלה.
          </p>
          <pre className="mt-3 overflow-x-auto rounded-xl bg-black/30 p-3 text-xs text-red-100/90">{error}</pre>
        </div>
      </div>
    )
  }

  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): LedgerStore {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>')
  return ctx
}
