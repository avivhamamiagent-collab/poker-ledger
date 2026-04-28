import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { participantsForSession, netForPlayer } from '../../../domain/selectors'
import { setCashout } from '../../../domain/session'
import { useRoster } from '../../hooks/useRoster'
import { useSession } from '../../hooks/useSession'
import { ils } from '../../../lib/money'
import { cn } from '../../../lib/utils'

export function SessionCashoutsPage() {
  const { roster } = useRoster()
  const { session, loading, error, persist } = useSession()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading…</CardTitle>
        </CardHeader>
      </Card>
    )
  }
  if (error || !session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Couldn’t load cashouts</CardTitle>
          {error && <CardDescription>{error}</CardDescription>}
        </CardHeader>
      </Card>
    )
  }

  const participants = participantsForSession(session, roster)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cashouts</CardTitle>
        <CardDescription>Net = cashout − total buy-ins.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {participants.length === 0 ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Select participants first.</div>
        ) : (
          <div className="grid gap-3">
            {participants.map((p) => {
              const cashout = session.cashouts[p.id] || 0
              const net = netForPlayer(session, p.id)
              return (
                <div key={p.id} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{p.name}</div>
                      <div className={cn('text-xs', net >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300')}>
                        Net: {ils(net)}
                      </div>
                    </div>
                    <div className={cn('text-sm font-semibold', net >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300')}>
                      {ils(net)}
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="mb-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">Cashout</div>
                    <Input
                      inputMode="numeric"
                      value={cashout || ''}
                      placeholder="0"
                      onChange={(e) => persist(setCashout(session, p.id, Number(e.target.value || 0), p.name))}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

