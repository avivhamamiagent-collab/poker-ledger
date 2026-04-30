import { useNavigate } from 'react-router-dom'
import { CalendarPlus, ChevronLeft, Download, Trash2 } from 'lucide-react'

import { createSession, totalBuyins, totalCashouts } from '../../domain/session'
import type { Session } from '../../domain/types'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useStore } from '../store-context'
import { useSessions } from '../hooks/useSessions'
import { useToast } from '../../components/ui/use-toast'
import { getEnv } from '../../config/env'
import { useInstallPrompt } from '../pwa/useInstallPrompt'
import { ils } from '../../lib/money'

export function SessionsPage() {
  const store = useStore()
  const { sessions, setSessions, loading, error } = useSessions()
  const nav = useNavigate()
  const toast = useToast()
  const env = getEnv()
  const install = useInstallPrompt()

  async function persist(next: Session) {
    await store.putSession(next)
    setSessions((prev) => {
      const rest = prev.filter((s) => s.id !== next.id)
      return [next, ...rest].sort((a, b) => b.updatedAt - a.updatedAt)
    })
  }

  async function onCreate() {
    try {
      const s = createSession()
      await persist(s)
      nav(`/session/${s.id}/entries`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'יצירת שולחן נכשלה'
      toast.push({ title: 'לא הצלחנו לפתוח שולחן', description: msg })
    }
  }

  async function onDelete(s: Session) {
    if (!window.confirm('Delete this session? This cannot be undone.')) return
    await store.deleteSession(s.id)
    setSessions((prev) => prev.filter((x) => x.id !== s.id))
    toast.push({ title: 'Session deleted', description: s.title || s.dateISO })
  }

  const activeCount = sessions.filter((s) => totalCashouts(s) === 0 || totalCashouts(s) !== totalBuyins(s)).length
  const totalVolume = sessions.reduce((sum, s) => sum + totalBuyins(s), 0)
  const latestDate = sessions[0]?.dateISO

  return (
    <div className="space-y-5 pb-10">
      <section className="gold-bezel overflow-hidden rounded-2xl bg-surface-container-low/72 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-tertiary/20 bg-tertiary/10 px-3 py-1 text-xs font-semibold text-tertiary">
              <span className="chip-face h-4 w-4 rounded-full" aria-hidden />
              שולחן פוקר פרטי
            </div>
            <h1 className="text-2xl font-black tracking-tight text-on-surface">השולחנות שלי</h1>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">כניסות, ריבאים, סגירות וסטלמנט במסך אחד ברור.</p>
          </div>
          <Button onClick={onCreate} className="relative shrink-0 overflow-hidden">
            <CalendarPlus className="h-4 w-4" />
            שולחן חדש
            <span
              aria-hidden
              className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.38),transparent)] bg-[length:200%_100%] opacity-35 motion-safe:animate-shimmer"
            />
          </Button>
        </div>

        <div className="relative z-10 mt-5 grid grid-cols-3 gap-2">
          <StatTile label="שולחנות" value={String(sessions.length)} />
          <StatTile label="פתוחים" value={String(activeCount)} />
          <StatTile label="ווליום" value={totalVolume ? ils(totalVolume) : '₪0'} />
        </div>
      </section>

      {install.canInstall ? (
        <div className="rounded-xl border border-tertiary/15 bg-surface-container/70 p-3 text-sm shadow-[0_12px_36px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-tertiary/12 text-tertiary">
                <Download className="h-4 w-4" />
              </div>
              <div>
                <div className="font-semibold">להתקין על המסך הראשי</div>
                <div className="text-xs text-on-surface-variant">גישה מהירה יותר, כמו אפליקציה אמיתית.</div>
              </div>
            </div>
            <Button variant="secondary" onClick={() => install.prompt().catch(() => {})}>
              התקנה
            </Button>
          </div>
        </div>
      ) : null}

      {error && <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>טוען…</CardTitle>
            <CardDescription>מושך נתונים מהאחסון.</CardDescription>
          </CardHeader>
        </Card>
      ) : sessions.length === 0 ? (
        <Card className="text-center">
          <CardHeader className="items-center">
            <div className="chip-face mb-2 h-16 w-16 rounded-full motion-safe:animate-chipBounce" />
            <CardTitle>אין עדיין שולחנות</CardTitle>
            <CardDescription>אפשר להתחיל ב״2 דקות״ מודרך, או לפתוח שולחן ראשון לבד.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => nav('/onboarding')}>התחלה מהירה (2 דקות)</Button>
            <Button variant="secondary" onClick={onCreate}>פתיחת שולחן ראשון</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sessions.map((s) => (
            <Card key={s.id} className="group hover:border-tertiary/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block truncate text-lg">{s.title || 'שולחן ללא שם'}</span>
                    <span className="mt-1 block text-xs font-medium text-on-surface-variant">{s.dateISO}</span>
                  </span>
                  <span className="rounded-full border border-tertiary/20 bg-tertiary/10 px-2.5 py-1 text-xs font-semibold text-tertiary">
                    {s.participantIds.length} שחקנים
                  </span>
                </CardTitle>
                <CardDescription>
                  {latestDate === s.dateISO ? 'המשחק האחרון' : `עודכן ${new Date(s.updatedAt).toLocaleDateString('he-IL')}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <MiniMetric label="כניסות" value={ils(totalBuyins(s))} />
                  <MiniMetric label="סגירות" value={ils(totalCashouts(s))} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <Button variant="secondary" onClick={() => nav(`/session/${s.id}`)}>
                  פתיחה
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" onClick={() => onDelete(s)} className="text-red-200 hover:text-red-100">
                    <Trash2 className="h-4 w-4" />
                    מחיקה
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-on-surface-variant">
        Storage:{' '}
        <span className="font-medium">{env.storage === 'supabase' ? 'Supabase (רב-מכשירי)' : 'IndexedDB מקומי'}</span>
        {env.storage === 'supabase' ? null : '. נשמר מקומית כברירת מחדל.'}
      </p>
    </div>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/16 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="text-[11px] font-semibold text-on-surface-variant">{label}</div>
      <div className="mt-1 truncate text-sm font-black tabular-nums text-on-surface sm:text-base">{value}</div>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-black/14 px-3 py-2">
      <div className="text-[11px] font-medium text-on-surface-variant">{label}</div>
      <div className="mt-0.5 text-sm font-semibold tabular-nums text-on-surface">{value}</div>
    </div>
  )
}
