import * as React from 'react'
import type { AppNotification } from '../../domain/types'
import { useStore } from '../store-context'

export function useNotifications() {
  const store = useStore()
  const [items, setItems] = React.useState<AppNotification[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setItems(await store.listNotifications())
    } catch (e: any) {
      setError(e?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [store])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  return { items, setItems, loading, error, refresh }
}
