import * as React from 'react'

type ToastItem = {
  id: string
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  durationMs?: number
}

type ToastContextValue = {
  toasts: ToastItem[]
  push: (t: Omit<ToastItem, 'id'>) => void
  dismiss: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

export function ToastsProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([])

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const push = React.useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID()
    const item: ToastItem = { id, durationMs: 3500, ...t }
    setToasts((prev) => [...prev, item])
    window.setTimeout(() => dismiss(id), item.durationMs)
  }, [dismiss])

  const value = React.useMemo(() => ({ toasts, push, dismiss }), [toasts, push, dismiss])

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastsProvider>')
  return ctx
}

