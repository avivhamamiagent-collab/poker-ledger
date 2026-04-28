import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft, Trash2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { useSession } from '../../hooks/useSession'
import { useRoster } from '../../hooks/useRoster'
import { delta, totalBuyins, totalCashouts } from '../../../domain/session'
import { ils } from '../../../lib/money'
import { cn } from '../../../lib/utils'
import { useStore } from '../../store-context'

export function SessionLayout() {
  const { session, loading, error } = useSession()
  const { roster } = useRoster()
  const store = useStore()
  const nav = useNavigate()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading session…</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (error || !session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session not found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">{error || 'This session does not exist.'}</div>
          <div className="mt-3">
            <Button asChild variant="secondary">
              <Link to="/">Back to sessions</Link>
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
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="text-xs text-zinc-500 dark:text-zinc-400">Session</div>
              <h1 className="truncate text-lg font-semibold tracking-tight">{session.title || 'Untitled session'}</h1>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{session.dateISO} · {session.participantIds.length} participants</div>
            </div>
          </div>
        </div>

        <Button
          variant="ghost"
          className="text-red-600 hover:text-red-700"
          onClick={async () => {
            if (!window.confirm('Delete this session? This cannot be undone.')) return
            await store.deleteSession(session.id)
            nav('/')
          }}
        >
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>

      <Card>
        <CardContent className="grid grid-cols-2 gap-3 pt-4">
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Total buy-ins</div>
            <div className="text-lg font-semibold">{ils(totalBuyins(session))}</div>
          </div>
          <div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">Total cashouts</div>
            <div className="text-lg font-semibold">{ils(totalCashouts(session))}</div>
          </div>
          <div className={cn('col-span-2 rounded-lg border p-2 text-sm', totalsOk ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200' : 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200')}>
            Delta: <span className="font-semibold">{ils(d)}</span> {totalsOk ? '(OK)' : '(check entries)'}
          </div>
        </CardContent>
      </Card>

      <div className="-mx-2 overflow-x-auto">
        <div className="flex gap-2 px-2">
          <SessionTab to="participants" label="Participants" />
          <SessionTab to="entries" label="Buy-ins/Rebuys" />
          <SessionTab to="cashout" label="Cashouts" />
          <SessionTab to="settlement" label="Settlement" />
          <SessionTab to="export" label="Export" />
          <SessionTab to="audit" label="Audit" />
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

