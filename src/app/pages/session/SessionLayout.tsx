import { Link, NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>טוען שולחן…</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error || !session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>השולחן לא נמצא</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{error || 'השולחן הזה לא קיים.'}</div>
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
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => nav('/')}>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">שולחן</div>
              <h1 className="truncate text-lg font-semibold tracking-tight">{session.title || 'שולחן ללא שם'}</h1>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{session.dateISO} · {session.participantIds.length} משתתפים</div>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          className="text-red-600 hover:text-red-700"
          onClick={async () => {
            if (!window.confirm('למחוק את השולחן הזה? אי אפשר לשחזר.')) return
            await store.deleteSession(session.id)
            nav('/')
          }}
        >
          <Trash2 className="h-4 w-4" />
          מחיקה
        </Button>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-3 pt-4">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">סה״כ כניסות</div>
            <div className="text-lg font-semibold">{ils(totalBuyins(session))}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">סה״כ סגירות</div>
            <div className="text-lg font-semibold">{ils(totalCashouts(session))}</div>
          </div>
          <div className={cn('col-span-2 rounded-lg border p-2 text-sm', totalsOk ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200' : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200')}>
            הפרש: <span className="font-semibold">{ils(d)}</span> {totalsOk ? '(תקין)' : '(בדקו נתונים)'}
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}

function SessionTab({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium',
          'border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300',
          isActive && 'bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900',
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