import type { ReactNode } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { Bell, Sparkles, Spade, Users, UsersRound } from 'lucide-react'

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
    <div className="app-shell min-h-dvh text-zinc-50">
      <div className="app-shell-bg pointer-events-none fixed inset-0" />

      <header className="sticky top-0 z-40 border-b border-white/8 bg-[#070b12]/72 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 font-semibold tracking-tight">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-amber-300/20 bg-[linear-gradient(180deg,rgba(212,175,55,0.22),rgba(26,71,42,0.25))] shadow-[0_0_40px_rgba(0,255,136,0.08)]">
              <Spade className="h-5 w-5 text-emerald-300" />
            </span>
            <span className="brand-glow text-base sm:text-lg">Poker Ledger</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-zinc-300 sm:flex">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Dark poker mode
            </div>
            {env.storage === 'supabase' ? (
              <Link
                to="/notifications"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/8 bg-white/5 text-zinc-200 transition hover:border-amber-300/30 hover:text-white hover:shadow-[0_0_24px_rgba(212,175,55,0.16)]"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
              </Link>
            ) : null}
            <div className="hidden rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1.5 text-xs text-emerald-100 sm:block">
              ₪ ILS
            </div>
            {enabled && user ? (
              <button
                type="button"
                className="rounded-full border border-white/8 bg-white/5 px-3 py-1.5 text-xs text-zinc-200 transition hover:border-white/20 hover:bg-white/10"
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

      <main className={cn('container relative z-10 pb-28 pt-5', isSession && 'pt-4')}>
        <RosterProvider>
          <Outlet />
        </RosterProvider>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/8 bg-[#070b12]/82 backdrop-blur-xl">
        <div className="container grid grid-cols-3 gap-2 py-2">
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
          'flex flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-2 text-xs font-medium transition',
          isActive
            ? 'border-amber-300/25 bg-[linear-gradient(180deg,rgba(212,175,55,0.18),rgba(26,71,42,0.24))] text-white shadow-[0_0_28px_rgba(0,255,136,0.1)]'
            : 'border-white/5 bg-white/3 text-zinc-400 hover:border-white/10 hover:bg-white/6 hover:text-zinc-200',
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}
