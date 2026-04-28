import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from './auth-context'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { enabled, user, loading } = useAuth()
  const location = useLocation()

  if (!enabled) return <>{children}</>
  if (loading) return null
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return <>{children}</>
}
