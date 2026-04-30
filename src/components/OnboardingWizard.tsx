import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from './ui/button'
import { cn } from '../lib/utils'
import { useAuth } from '../app/auth/auth-context'

type Step = {
  title: string
  description: string
  icon: string
  cta?: { label: string; to: string }
}

function storageKey(userId: string) {
  return `onboarding_complete_${userId}`
}

const STEPS: Step[] = [
  {
    title: 'ברוכים הבאים לפנקס פוקר 🎰',
    description: 'מערכת לניהול קבוצות, משחקים והתחשבנויות — בעברית, RTL-first, ובסטייל של קזינו יוקרתי.',
    icon: 'casino',
  },
  {
    title: 'צור קבוצת משחק',
    description: 'כל משחק שייך לקבוצה. צרו קבוצה אחת (חברים/מועדון) והכל יתארגן מסביבה.',
    icon: 'groups',
    cta: { label: 'צור קבוצה', to: '/groups/new' },
  },
  {
    title: 'הזמן שחקנים',
    description: 'הוסיפו שחקנים לקבוצה — ואז הם יהיו זמינים בלחיצה בכל משחק.',
    icon: 'person_add',
  },
  {
    title: 'התחל משחק',
    description: 'פתחו סשן חדש, הגדירו בליינדים, והתחילו להזין כניסות וריבאיים תוך כדי.',
    icon: 'play_circle',
  },
  {
    title: 'עקוב אחרי הכסף',
    description: 'רושמים buy-ins ו-cashouts בצורה מהירה — תמיד יודעים מי למעלה ומי למטה.',
    icon: 'payments',
  },
  {
    title: 'התחשבנות חכמה',
    description: 'בסוף הערב — התחשבנות אוטומטית והצעת העברות בלחיצה אחת, בלי כאב ראש.',
    icon: 'swap_horiz',
  },
]

export function OnboardingWizard({ onComplete }: { onComplete?: () => void }) {
  const { user } = useAuth()
  const nav = useNavigate()
  const [open, setOpen] = React.useState(false)

  const [active, setActive] = React.useState(0)
  const [prev, setPrev] = React.useState<number | null>(null)
  const [direction, setDirection] = React.useState<'next' | 'prev'>('next')
  const [animating, setAnimating] = React.useState(false)

  // Check per-user onboarding completion
  React.useEffect(() => {
    if (!user) return
    try {
      const done = localStorage.getItem(storageKey(user.id))
      setOpen(done !== 'true')
    } catch {
      setOpen(true)
    }
  }, [user])

  React.useEffect(() => {
    if (!animating) return
    const t = window.setTimeout(() => {
      setPrev(null)
      setAnimating(false)
    }, 320)
    return () => window.clearTimeout(t)
  }, [animating])

  function goNext() {
    if (active >= STEPS.length - 1) return
    setPrev(active)
    setDirection('next')
    setActive((s) => Math.min(STEPS.length - 1, s + 1))
    setAnimating(true)
  }

  function goPrev() {
    if (active <= 0) return
    setPrev(active)
    setDirection('prev')
    setActive((s) => Math.max(0, s - 1))
    setAnimating(true)
  }

  function finish() {
    if (!user) return
    try {
      localStorage.setItem(storageKey(user.id), 'true')
    } catch {
      // ignore
    }
    setOpen(false)
    onComplete?.()
    nav('/groups', { replace: true })
  }

  function skip() {
    if (!user) return
    try {
      localStorage.setItem(storageKey(user.id), 'true')
    } catch {
      // ignore
    }
    setOpen(false)
  }

  if (!open) return null

  const step = STEPS[active]

  return (
    <div className="fixed inset-0 z-[100] flex min-h-dvh items-center justify-center bg-black/70 px-4 py-6 backdrop-blur-sm rtl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,136,0.12),transparent_38%),radial-gradient(circle_at_85%_22%,rgba(212,175,55,0.14),transparent_22%)]" />

      <div className="relative w-full max-w-[460px] overflow-hidden rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(8,28,21,0.92),rgba(7,11,18,0.92))] p-6 shadow-[0_40px_120px_rgba(0,0,0,0.65)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-44 w-44 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative">
          <div className="relative h-[340px] overflow-hidden">
            {prev !== null && (
              <StepPanel
                step={STEPS[prev]}
                phase="leaving"
                direction={direction}
                animate={animating}
              />
            )}
            <StepPanel
              step={step}
              phase={prev === null ? 'static' : 'entering'}
              direction={direction}
              animate={animating}
            />
          </div>

          <div className="mt-5 flex items-center justify-between">
            <button
              type="button"
              onClick={goPrev}
              disabled={active === 0 || animating}
              className={cn(
                'text-xs font-medium text-zinc-200/80 transition-opacity',
                active === 0 || animating ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:text-zinc-50',
              )}
            >
              הקודם
            </button>

            <div className="flex items-center gap-2">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 w-1.5 rounded-full transition-all',
                    i === active ? 'w-5 bg-amber-300 shadow-[0_0_20px_rgba(212,175,55,0.35)]' : 'bg-white/15',
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={skip}
              className="text-xs font-medium text-zinc-200/80 hover:text-zinc-50"
            >
              דלג
            </button>
          </div>

          <div className="mt-5 flex gap-2">
            {step.cta && (
              <Button
                type="button"
                variant="secondary"
                className="h-11 flex-1 rounded-2xl border border-white/10 bg-white/5 text-zinc-100 hover:bg-white/10"
                onClick={() => nav(step.cta!.to)}
                disabled={animating}
              >
                {step.cta.label}
              </Button>
            )}

            {active < STEPS.length - 1 ? (
              <Button
                type="button"
                className="h-11 flex-1 rounded-2xl border border-amber-300/20 bg-[linear-gradient(180deg,#d4af37,#a97f11)] font-semibold text-[#1a1200] hover:bg-[linear-gradient(180deg,#e3bf4e,#b88c17)]"
                onClick={goNext}
                disabled={animating}
              >
                הבא
              </Button>
            ) : (
              <Button
                type="button"
                className="h-11 flex-1 rounded-2xl border border-emerald-300/20 bg-[linear-gradient(180deg,#35d08a,#148a5a)] font-semibold text-[#04160d] hover:bg-[linear-gradient(180deg,#52e0a0,#1aa26a)]"
                onClick={finish}
                disabled={animating}
              >
                בואו נתחיל! 🚀
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StepPanel({
  step,
  phase,
  direction,
  animate,
}: {
  step: Step
  phase: 'static' | 'entering' | 'leaving'
  direction: 'next' | 'prev'
  animate: boolean
}) {
  const [pos, setPos] = React.useState<'center' | 'left' | 'right'>(() => {
    if (phase === 'static') return 'center'
    if (phase === 'entering') return direction === 'next' ? 'right' : 'left'
    return 'center'
  })

  React.useEffect(() => {
    if (!animate) return
    const raf = window.requestAnimationFrame(() => {
      if (phase === 'entering') setPos('center')
      if (phase === 'leaving') setPos(direction === 'next' ? 'left' : 'right')
    })
    return () => window.cancelAnimationFrame(raf)
  }, [animate, phase, direction])

  return (
    <div
      className={cn(
        'absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-300 ease-out',
        pos === 'center' && 'translate-x-0 opacity-100',
        pos === 'left' && '-translate-x-full opacity-0',
        pos === 'right' && 'translate-x-full opacity-0',
      )}
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-amber-300/20 bg-white/5 shadow-[0_0_70px_rgba(212,175,55,0.16)]">
        <span className="material-symbols-outlined text-[40px] text-amber-300">{step.icon}</span>
      </div>
      <div className="mt-6 text-2xl font-semibold tracking-tight text-zinc-50">{step.title}</div>
      <div className="mt-3 max-w-[34ch] text-sm leading-7 text-zinc-300">{step.description}</div>
    </div>
  )
}
