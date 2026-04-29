import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { cn } from '../../lib/utils'
import { OnboardingWizard } from '../../components/OnboardingWizard'
import { useAuth } from '../auth/auth-context'
import { RosterProvider } from '../roster/roster-context'

export function AppShell() {
  const location = useLocation()
  const nav = useNavigate()
  const path = location.pathname
  const { enabled, user } = useAuth()

  return (
    <div className="felt-texture bg-background text-on-background min-h-dvh font-body-lg flex flex-col">
      <div className="casino-ambient-glow" />

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#041710]/82 backdrop-blur-xl border-b border-[#D4AF37]/20 shadow-[0_12px_40px_rgba(0,0,0,0.34)] flex justify-between items-center px-5 h-16">
        <button
          type="button"
          onClick={() => nav('/profile')}
          className="gold-bezel flex items-center justify-center w-10 h-10 rounded-xl bg-surface-container-high/80 overflow-hidden shrink-0 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="פרופיל"
        >
          <span className="material-symbols-outlined text-tertiary text-[21px]">person</span>
        </button>

        <div className="flex min-w-0 items-center gap-3">
          <span className="chip-face h-9 w-9 shrink-0 rounded-full" aria-hidden />
          <div className="min-w-0 text-right">
            <h1 className="truncate text-lg font-black text-[#E9C349]">פנקס פוקר</h1>
            <p className="truncate text-[11px] font-medium text-on-surface-variant">ניהול שולחן חי</p>
          </div>
        </div>

        <Link
          to="/groups"
          className="text-emerald-300 hover:bg-[#1B4332] transition-all duration-200 active:scale-[0.98] active:opacity-80 p-2 rounded-xl flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="קבוצות"
        >
          <span className="material-symbols-outlined">groups</span>
        </Link>
      </header>

      {/* Main Content Canvas */}
      <main className="mx-auto flex w-full max-w-5xl flex-grow flex-col gap-section-margin px-container-padding pb-[104px] pt-[88px] relative z-10 md:pr-24">
        <RosterProvider>
          <Outlet />
        </RosterProvider>
      </main>

      {enabled && user && <OnboardingWizard />}

      <nav className="fixed right-5 top-24 z-40 hidden w-16 flex-col items-center gap-3 rounded-2xl border border-tertiary/15 bg-[#071b13]/82 p-2 shadow-[0_20px_60px_rgba(0,0,0,0.38)] backdrop-blur-xl md:flex">
        <SideNavButton active={path === '/' || path.startsWith('/session/')} onClick={() => nav('/')} label="בית" icon="home" />
        <SideNavButton
          active={path.startsWith('/groups') || path.startsWith('/group') || path.startsWith('/game')}
          onClick={() => nav('/groups')}
          label="קבוצות"
          icon="groups"
        />
        <SideNavButton active={path.startsWith('/roster')} onClick={() => nav('/roster')} label="שחקנים" icon="group_add" />
        <SideNavButton
          active={path.startsWith('/notifications')}
          onClick={() => nav('/notifications')}
          label="התראות"
          icon="notifications"
        />
        <SideNavButton
          active={path.startsWith('/profile') || path.startsWith('/settings')}
          onClick={() => nav('/profile')}
          label="פרופיל"
          icon="person"
        />
      </nav>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center h-20 pb-safe px-4 bg-[#071b13]/92 backdrop-blur-xl border-t border-[#D4AF37]/15 shadow-[0_-12px_36px_rgba(0,0,0,0.5)] rounded-t-2xl md:hidden">
        <BottomNavButton
          active={path === '/' || path.startsWith('/session/')}
          onClick={() => nav('/')}
          label="בית"
          icon="home"
        />
        <BottomNavButton active={path === '/sessions'} onClick={() => nav('/sessions')} label="היסטוריה" icon="history" />
        <BottomNavButton
          active={path.startsWith('/groups') || path.startsWith('/group') || path.startsWith('/game')}
          onClick={() => nav('/groups')}
          label="קבוצות"
          icon="groups"
        />
        <BottomNavButton active={path.startsWith('/roster')} onClick={() => nav('/roster')} label="שחקנים" icon="group_add" />
        <BottomNavButton
          active={path.startsWith('/notifications')}
          onClick={() => nav('/notifications')}
          label="התראות"
          icon="notifications"
        />
        <BottomNavButton
          active={path.startsWith('/profile') || path.startsWith('/settings')}
          onClick={() => nav('/profile')}
          label="פרופיל"
          icon="person"
        />
      </nav>
    </div>
  )
}

function SideNavButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active ? 'bg-tertiary/14 text-tertiary shadow-[0_0_0_1px_rgba(233,195,73,0.22)]' : 'text-on-surface-variant hover:bg-white/5 hover:text-emerald-300',
      )}
      title={label}
      aria-label={label}
    >
      <span className="material-symbols-outlined" style={active ? { fontVariationSettings: '"FILL" 1' } : undefined}>
        {icon}
      </span>
    </button>
  )
}

function BottomNavButton({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-14 flex-col items-center justify-center transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl',
        active ? 'text-[#E9C349] scale-105' : 'text-on-surface-variant/70 hover:text-emerald-300 active:-translate-y-0.5 duration-300',
      )}
    >
      <span
        className={cn(
          'material-symbols-outlined mb-1 grid h-8 w-8 place-items-center rounded-xl transition-colors',
          active && 'bg-tertiary/12 shadow-[0_0_0_1px_rgba(233,195,73,0.22)]',
        )}
        style={active ? { fontVariationSettings: '"FILL" 1' } : undefined}
      >
        {icon}
      </span>
      <span className="text-[10px] font-medium font-inter">{label}</span>
    </button>
  )
}
