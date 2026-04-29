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
    <div className="bg-background text-on-background min-h-dvh font-body-lg flex flex-col">
      <div className="casino-ambient-glow" />

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-[#081C15]/80 dark:bg-[#081C15]/80 backdrop-blur-xl border-b border-[#D4AF37]/20 shadow-2xl flex flex-row-reverse justify-between items-center px-6 h-16 rtl">
        <button
          type="button"
          onClick={() => nav('/profile')}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-variant overflow-hidden border border-[rgba(212,175,55,0.3)] shrink-0 transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="פרופיל"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
        </button>

        <h1 className="text-xl font-black text-[#D4AF37] tracking-widest font-inter tracking-tight text-right text-headline-md font-headline-md">
          פנקס פוקר
        </h1>

        <Link
          to="/groups"
          className="text-emerald-500 dark:text-emerald-400 hover:bg-[#1B4332] transition-all duration-200 scale-95 active:scale-[0.98] active:opacity-80 p-2 rounded-full flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          aria-label="קבוצות"
        >
          <span className="material-symbols-outlined">groups</span>
        </Link>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-grow pt-[88px] pb-[100px] px-container-padding flex flex-col gap-section-margin relative z-10">
        <RosterProvider>
          <Outlet />
        </RosterProvider>
      </main>

      {enabled && user && <OnboardingWizard />}

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex flex-row-reverse justify-around items-center h-20 pb-safe px-4 rtl bg-[#1B4332]/90 dark:bg-[#1B4332]/90 backdrop-blur-xl border-t border-[#D4AF37]/15 shadow-[0_-4px_20px_rgba(0,0,0,0.5)] rounded-t-xl md:hidden">
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
        'flex flex-col items-center justify-center transition-all duration-200 w-16 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-xl',
        active ? 'text-[#D4AF37] scale-110 motion-safe:animate-goldPulse' : 'text-slate-400 opacity-60 hover:text-emerald-300 active:-translate-y-0.5 duration-300',
      )}
    >
      <span
        className="material-symbols-outlined mb-1"
        style={active ? ({ fontVariationSettings: '"FILL" 1' } as any) : undefined}
      >
        {icon}
      </span>
      <span className="text-[11px] font-medium font-inter">{label}</span>
    </button>
  )
}
