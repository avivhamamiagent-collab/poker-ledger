import * as React from 'react'
import type { Group } from '../../domain/types'
import { useStore } from '../store-context'

export function useGroups() {
  const store = useStore()
  const [groups, setGroups] = React.useState<Group[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setGroups(await store.listGroups())
    } catch (e: any) {
      setError(e?.message || 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }, [store])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  return { groups, setGroups, loading, error, refresh }
}
