import { useNavigate } from 'react-router-dom'
import { CalendarPlus, ChevronLeft, History } from 'lucide-react'

import { createSession, totalBuyins, totalCashouts } from '../../domain/session'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { useStore } from '../store-context'
import { useSessions } from '../hooks/useSessions'
import { ils } from '../../lib/money'
import { useToast } from '../../components/ui/use-toast'

export function HomePage() {
  const store = useStore()
  const { sessions, loading } = useSessions()
  const nav = useNavigate()
  const toast = useToast()
  async function onCreate() {
    try {
      const s = createSession()
      await store.putSession(s)
      nav(`/session/${s.id}/entries`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'יצירת שולחן נכשלה'
      toast.push({ title: 'לא הצלחנו לפתוח שולחן', description: msg })
    }
  }

  // Stats
  const totalGames = sessions.length
  const activeGames = sessions.filter((s) => totalCashouts(s) === 0 || totalCashouts(s) !== totalBuyins(s)).length
  const totalVolume = sessions.reduce((sum, s) => sum + totalBuyins(s), 0)
  const recentSessions = sessions.slice(0, 3)

  if (loading) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <div className="text-on-surface-variant">טוען…</div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-10">
      {/* Hero */}
      <section className="gold-bezel overflow-hidden rounded-2xl bg-surface-container-low/72 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
        <div className="relative z-10">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-tertiary/20 bg-tertiary/10 px-3 py-1 text-xs font-semibold text-tertiary">
            <span className="chip-face h-4 w-4 rounded-full" aria-hidden />
            פנקס פוקר
          </div>
          <h1 className="text-2xl font-black tracking-tight text-on-surface">ניהול ערבי פוקר</h1>
          <p className="mt-1 text-sm leading-6 text-on-surface-variant">
            מוכן למשחק? פתח שולחן חדש או המשך משחק פתוח.
          </p>

          <div className="mt-4 flex gap-2">
            <Button onClick={onCreate} className="relative overflow-hidden">
              <CalendarPlus className="h-4 w-4" />
              שולחן חדש
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.38),transparent)] bg-[length:200%_100%] opacity-35 motion-safe:animate-shimmer"
              />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="relative z-10 mt-5 grid grid-cols-3 gap-2">
          <StatTile label="משחקים" value={String(totalGames)} />
          <StatTile label="פתוחים" value={String(activeGames)} accent />
          <StatTile label="ווליום" value={totalVolume ? ils(totalVolume) : '₪0'} />
        </div>
      </section>

      {/* Active Games */}
      {activeGames > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-on-surface">משחקים פתוחים</h2>
            <Button variant="ghost" size="sm" onClick={() => nav('/sessions')}>
              הכל
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-3">
            {sessions
              .filter((s) => totalCashouts(s) === 0 || totalCashouts(s) !== totalBuyins(s))
              .slice(0, 3)
              .map((s) => (
                <Card
                  key={s.id}
                  className="group cursor-pointer transition-all duration-200 hover:border-tertiary/30 active:scale-[0.98]"
                  onClick={() => nav(`/session/${s.id}/entries`)}
                >
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-on-surface">{s.title || 'שולחן ללא שם'}</div>
                      <div className="mt-1 text-xs text-on-surface-variant">{s.dateISO} · {s.participantIds.length} שחקנים</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-left">
                        <div className="text-xs text-on-surface-variant">כניסות</div>
                        <div className="text-sm font-bold tabular-nums text-tertiary">{ils(totalBuyins(s))}</div>
                      </div>
                      <ChevronLeft className="h-5 w-5 text-on-surface-variant" />
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </section>
      )}

      {/* Recent Activity */}
      {recentSessions.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-on-surface">פעילות אחרונה</h2>
            <Button variant="ghost" size="sm" onClick={() => nav('/sessions')}>
              <History className="h-4 w-4" />
              היסטוריה מלאה
            </Button>
          </div>
          <div className="grid gap-2">
            {recentSessions.map((s) => {
              const buyins = totalBuyins(s)
              const cashouts = totalCashouts(s)
              const isOpen = cashouts === 0 || cashouts !== buyins
              return (
                <div
                  key={s.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl border border-white/5 bg-surface-container/50 p-3 transition-all duration-200 hover:border-tertiary/20 active:scale-[0.98]"
                  onClick={() => nav(`/session/${s.id}/entries`)}
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-on-surface">{s.title || 'שולחן'}</div>
                    <div className="text-xs text-on-surface-variant">{s.dateISO}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${isOpen ? 'text-tertiary' : 'text-on-surface-variant'}`}>
                      {isOpen ? 'פתוח' : 'סגור'}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-on-surface">{ils(buyins)}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Empty State */}
      {totalGames === 0 && (
        <Card className="text-center">
          <CardContent className="flex flex-col items-center gap-3 p-8">
            <div className="chip-face mb-2 h-16 w-16 rounded-full motion-safe:animate-chipBounce" />
            <h2 className="text-xl font-bold text-on-surface">אין עדיין משחקים</h2>
            <p className="text-sm text-on-surface-variant">פתח שולחן ראשון והתחל לנהל את הפוקר כמו מקצוען.</p>
            <Button onClick={onCreate}>
              <CalendarPlus className="h-4 w-4" />
              פתיחת שולחן ראשון
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatTile({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/16 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="text-[11px] font-semibold text-on-surface-variant">{label}</div>
      <div className={`mt-1 truncate text-sm font-black tabular-nums sm:text-base ${accent ? 'text-tertiary' : 'text-on-surface'}`}>
        {value}
      </div>
    </div>
  )
}
