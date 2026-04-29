import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Bell, Users, Spade, UsersRound } from 'lucide-react'

import { cn } from '../../lib/utils'
import { getEnv } from '../../config/env'
import { useAuth } from '../auth/auth-context'
import { RosterProvider } from '../roster/roster-context'

export function AppShell() {
  const location = useLocation()
  const isSession = location.pathname.startsWith('/session/')
  const env = getEnv()
  const { enabled, user } = useAuth()

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <Spade className="h-5 w-5" />
            <span>Poker Ledger</span>
          </Link>
          <div className="flex items-center gap-2">
            {env.storage === 'supabase' ? (
              <Link
                to="/notifications"
                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-white/10"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </Link>
            ) : null}
            <div className="text-xs text-zinc-300">₪ ILS</div>
            {enabled && user ? (
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs text-zinc-200 hover:bg-white/10"
                onClick={() => {
                  import('../../data/supabase/client').then((m) => m.supabase().auth.signOut())
                }}
              >
                יציאה
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className={cn('container pb-24 pt-4', isSession && 'pt-3')}>
        <RosterProvider>
          <Outlet />
        </RosterProvider>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/10 bg-[#070b12]/90 backdrop-blur">
        <div className="container grid grid-cols-3">
          <BottomNavItem to="/groups" label="קבוצות" icon={<UsersRound className="h-5 w-5" />} />
          <BottomNavItem to="/roster" label="רוסטר" icon={<Users className="h-5 w-5" />} />
          <BottomNavItem to="/" label="שולחנות" icon={<Spade className="h-5 w-5" />} end />
        </div>
      </nav>
    </div>
  )
}

function BottomNavItem({
  to,
  label,
  icon,
  end,
}: {
  to: string
  label: string
  icon: ReactNode
  end?: boolean
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-zinc-400',
          isActive && 'text-white',
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

