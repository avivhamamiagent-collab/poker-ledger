import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { SessionsPage } from './SessionsPage'
import { useSessions } from '../hooks/useSessions'

export function HomePage() {
  const { sessions, loading } = useSessions()
  const nav = useNavigate()

  React.useEffect(() => {
    if (loading) return
    const latest = sessions[0]
    if (latest) {
      nav(`/session/${latest.id}/entries`, { replace: true })
    }
  }, [loading, sessions, nav])

  // Fallback when no sessions
  return <SessionsPage />
}
