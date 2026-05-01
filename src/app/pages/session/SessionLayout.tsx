import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, CircleDollarSign, Trash2, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { SkeletonCard } from '../../../components/ui/skeleton'
import { useConfirm } from '../../../components/ui/confirm-dialog'
import { useSession } from '../../hooks/useSession'
import { useRoster } from '../../hooks/useRoster'
import { delta, totalBuyins, totalCashouts } from '../../../domain/session'
import { ils } from '../../../lib/money'
import { cn } from '../../../lib/utils'
import { useStore } from '../../store-context'
import { SessionProvider } from './session-context'

function SessionContent() {
  const { session, loading, error } = useSession()
  const { roster } = useRoster()
  const store = useStore()
  const nav = useNavigate()
  const { confirm, dialog: confirmDialog } = useConfirm()

  if (loading) {
    return <SkeletonCard rows={3} />
  }

  if (error || !session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>השולחן לא נמצא</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-on-surface-variant">{error || 'השולחן הזה לא קיים.'}</div>
          <div className="mt-3">
            <Button asChild variant="secondary">
              <Link to="/">חזרה לשולחנות</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const d = delta(session)
  const totalsOk = Math.abs(d) < 0.000001

  return (
    <div className="space-y-4">
      <section className="gold-bezel overflow-hidden rounded-2xl bg-surface-container-low/78 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.34)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => nav('/')} aria-label="חזרה">
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-tertiary">שולחן פעיל</div>
              <h1 className="truncate text-xl font-black tracking-tight text-on-surface">{session.title || 'שולחן ללא שם'}</h1>
              <div className="text-xs text-on-surface-variant">{session.dateISO} · {session.participantIds.length} משתתפים</div>
            </div>
          </div>
          </div>

          <Button
            variant="ghost"
            className="text-red-200 hover:text-red-100"
            onClick={async () => {
              const ok = await confirm({
                title: 'מחיקת שולחן',
                description: `"${session.title || session.dateISO}" יימחק לצמיתות.`,
                confirmLabel: 'מחיקה',
                destructive: true,
              })
              if (!ok) return
              await store.deleteSession(session.id)
              nav('/')
            }}
          >
            <Trash2 className="h-4 w-4" />
            מחיקה
          </Button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/8 bg-black/16 p-3">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <CircleDollarSign className="h-4 w-4 text-tertiary" />
              סה״כ כניסות
            </div>
            <div className="mt-1 text-lg font-black tabular-nums text-on-surface">{ils(totalBuyins(session))}</div>
          </div>
          <div className="rounded-xl border border-white/8 bg-black/16 p-3">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <Users className="h-4 w-4 text-emerald-300" />
              סה״כ סגירות
            </div>
            <div className="mt-1 text-lg font-black tabular-nums text-on-surface">{ils(totalCashouts(session))}</div>
          </div>
          <div className={cn('col-span-2 rounded-xl border p-3 text-sm', totalsOk ? 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100' : 'border-amber-300/25 bg-amber-300/10 text-amber-100')}>
            הפרש: <span className="font-semibold">{ils(d)}</span> {totalsOk ? '(תקין)' : '(בדקו נתונים)'}
          </div>
        </div>
      </section>

      <div className="-mx-2 overflow-x-auto">
        <div className="flex gap-2 px-2">
          <SessionTab to="participants" label="משתתפים" />
          <SessionTab to="entries" label="כניסות" />
          <SessionTab to="cashout" label="סגירות" />
          <SessionTab to="settlement" label="סגירה" />
          <SessionTab to="export" label="ייצוא" />
          <SessionTab to="audit" label="ביקורת" />
        </div>
      </div>

      <Outlet context={{ session, roster }} />
      {confirmDialog}
    </div>
  )
}

function SessionTab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'shrink-0 rounded-full border px-3.5 py-2 text-sm font-semibold transition-all',
          'border-tertiary/14 bg-surface-container/70 text-on-surface-variant',
          isActive && 'border-tertiary/30 bg-tertiary/14 text-tertiary shadow-[0_0_0_1px_rgba(233,195,73,0.08)]',
        )
      }
    >
      {label}
    </NavLink>
  )
}

export function SessionLayout() {
  const { id } = useParams()
  if (!id) return null
  return (
    <SessionProvider id={id}>
      <SessionContent />
    </SessionProvider>
  )
}
