import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Bell, Users, Spade, UsersRound } from 'lucide-react'

import { cn } from '../../lib/utils'
import { getEnv } from '../../config/env'
import { supabase } from '../../data/supabase/client'
import { useAuth } from '../auth/auth-context'

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
                className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </Link>
            ) : null}
            <div className="text-xs text-zinc-500 dark:text-zinc-400">₪ ILS</div>
            {enabled && user ? (
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
                onClick={() => supabase().auth.signOut()}
              >
                Sign out
              </button>
            ) : null}
          </div>
        </div>
      </header>

      <main className={cn('container pb-24 pt-4', isSession && 'pt-3')}>
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
        <div className="container grid grid-cols-3">
          <BottomNavItem to="/" label="Sessions" icon={<Spade className="h-5 w-5" />} end />
          <BottomNavItem to="/roster" label="Roster" icon={<Users className="h-5 w-5" />} />
          <BottomNavItem to="/groups" label="Groups" icon={<UsersRound className="h-5 w-5" />} />
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
          'flex flex-col items-center justify-center gap-1 py-3 text-xs font-medium text-zinc-500',
          isActive && 'text-zinc-950 dark:text-zinc-50',
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

