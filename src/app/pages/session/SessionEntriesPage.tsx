import { Minus, Plus } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { useRoster } from '../../hooks/useRoster'
import { useSession } from '../../hooks/useSession'
import { participantsForSession } from '../../../domain/selectors'
import { addRebuyUnits, setBuyin, setRebuyUnits, totalBuyinForPlayer } from '../../../domain/session'
import { REBUY_UNIT_ILS } from '../../../domain/types'
import { ils } from '../../../lib/money'

export function SessionEntriesPage() {
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
          <CardTitle>Couldn’t load entries</CardTitle>
          {error && <CardDescription>{error}</CardDescription>}
        </CardHeader>
      </Card>
    )
  }

  const participants = participantsForSession(session, roster)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Buy-ins & Rebuys</CardTitle>
        <CardDescription>Rebuy unit is {ils(REBUY_UNIT_ILS)}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {participants.length === 0 ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">Select participants first.</div>
        ) : (
          <div className="grid gap-3">
            {participants.map((p) => {
              const buyin = session.buyins[p.id] || 0
              const units = session.rebuyUnits[p.id] || 0
              const total = totalBuyinForPlayer(session, p.id)
              return (
                <div key={p.id} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">{p.name}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">Total buy-in: {ils(total)}</div>
                    </div>
                    <div className="text-sm font-semibold">{ils(total)}</div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div>
                      <div className="mb-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">Buy-in</div>
                      <Input
                        inputMode="numeric"
                        value={buyin || ''}
                        placeholder="0"
                        onChange={(e) => persist(setBuyin(session, p.id, Number(e.target.value || 0), p.name))}
                      />
                    </div>
                    <div>
                      <div className="mb-1 text-xs font-medium text-zinc-600 dark:text-zinc-300">Rebuy units</div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={() => persist(addRebuyUnits(session, p.id, -1, p.name))}
                          disabled={units <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          inputMode="numeric"
                          value={units || ''}
                          placeholder="0"
                          onChange={(e) => persist(setRebuyUnits(session, p.id, Number(e.target.value || 0), p.name))}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="icon"
                          onClick={() => persist(addRebuyUnits(session, p.id, 1, p.name))}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {units} units = {ils(units * REBUY_UNIT_ILS)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button variant="outline" onClick={() => persist(addRebuyUnits(session, p.id, 1, p.name))}>
                      +{ils(50)}
                    </Button>
                    <Button variant="outline" onClick={() => persist(addRebuyUnits(session, p.id, 2, p.name))}>
                      +{ils(100)}
                    </Button>
                    <Button variant="outline" onClick={() => persist(addRebuyUnits(session, p.id, 4, p.name))}>
                      +{ils(200)}
                    </Button>
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

