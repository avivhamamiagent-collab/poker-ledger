import * as React from 'react'
import type { LedgerStore } from '../data/store-types'
import { createStore } from '../data/store'

const StoreContext = React.createContext<LedgerStore | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = React.useState(() => createStore())
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export function useStore(): LedgerStore {
  const ctx = React.useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within <StoreProvider>')
  return ctx
}

