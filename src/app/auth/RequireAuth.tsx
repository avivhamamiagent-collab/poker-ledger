import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './auth-context'
import { SplashScreen } from '../../components/SplashScreen'

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { enabled, user, loading } = useAuth()
  const location = useLocation()

  if (!enabled) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 text-on-background">
        <div className="w-full max-w-lg rounded-2xl border border-red-400/20 bg-red-500/10 p-5">
          <h1 className="text-xl font-black text-red-100">Supabase לא מוגדר</h1>
          <p className="mt-2 text-sm leading-6 text-red-100/90">
            אין אפשרות להיכנס בלי Supabase. יש להגדיר `VITE_SUPABASE_URL` ו־`VITE_SUPABASE_ANON_KEY`.
          </p>
        </div>
      </div>
    )
  }
  if (loading) return <SplashScreen />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  return <>{children}</>
}
