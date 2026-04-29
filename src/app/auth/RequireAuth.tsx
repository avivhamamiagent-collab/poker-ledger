import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from './auth-context'
import { SplashScreen } from '../../components/SplashScreen'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { enabled, user, loading, error } = useAuth()
  const location = useLocation()

  if (!enabled) return <>{children}</>
  if (loading) return <SplashScreen />
  if (error) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#070b12] px-6 text-center text-zinc-50">
        <div className="max-w-md space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/30">
          <div className="text-lg font-semibold">Login unavailable</div>
          <div className="text-sm text-zinc-300">{error}</div>
          <div className="text-xs text-zinc-500">Reloading usually fixes this after deploy or auth config changes.</div>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return <>{children}</>
}
