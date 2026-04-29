import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from './auth-context'
import { SplashScreen } from '../../components/SplashScreen'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <SplashScreen />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return <>{children}</>
}
