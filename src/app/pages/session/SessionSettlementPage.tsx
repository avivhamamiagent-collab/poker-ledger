import { ExternalLink, Copy } from 'lucide-react'

import type { Player } from '../../../domain/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { useRoster } from '../../hooks/useRoster'
import { useSession } from '../../hooks/useSession'
import { computeSettlement } from '../../../domain/settlement'
import { delta, setAllowDeltaOverride, totalBuyinForPlayer } from '../../../domain/session'
import { ils } from '../../../lib/money'
import { copyText } from '../../../lib/clipboard'
import { useToast } from '../../../components/ui/use-toast'

function playerName(roster: Player[], playerId: string) {
  return roster.find((p) => p.id === playerId)?.name || playerId
}

export function SessionSettlementPage() {
  const toast = useToast()
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
          <CardTitle>Couldn’t load settlement</CardTitle>
          {error && <CardDescription>{error}</CardDescription>}
        </CardHeader>
      </Card>
    )
  }

  const d = delta(session)
  const totalsOk = Math.abs(d) < 0.000001
  const blocked = !totalsOk && !session.allowDeltaOverride

  const transfers = computeSettlement(
    session.participantIds.map((pid) => ({
      playerId: pid,
      net: (session.cashouts[pid] || 0) - totalBuyinForPlayer(session, pid),
    })),
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Settlement</CardTitle>
        <CardDescription>Computed from net per player (cashout − total buy-ins).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {!totalsOk && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
            Totals don’t match (delta {ils(d)}). Fix entries/cashouts, or allow override.
            <div className="mt-2">
              <Button
                variant={session.allowDeltaOverride ? 'secondary' : 'default'}
                onClick={() => persist(setAllowDeltaOverride(session, !session.allowDeltaOverride))}
              >
                {session.allowDeltaOverride ? 'Disable override' : 'Allow override'}
              </Button>
            </div>
          </div>
        )}

        {blocked ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200">
            Settlement is blocked until totals match or override is enabled.
          </div>
        ) : transfers.length === 0 ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">No transfers needed (or missing data).</div>
        ) : (
          <div className="grid gap-2">
            {transfers.map((t, idx) => {
              const payer = playerName(roster, t.fromPlayerId)
              const receiver = playerName(roster, t.toPlayerId)
              const msg = `Hey ${payer}, you owe me ${Math.round(t.amount)}₪ for poker night ${session.dateISO}.`

              return (
                <div key={idx} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
                  <div className="font-semibold">
                    {payer} → {receiver} · {ils(t.amount)}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        await copyText(msg)
                        toast.push({ title: 'Copied', description: 'Payment request text copied to clipboard.' })
                      }}
                    >
                      <Copy className="h-4 w-4" />
                      Copy request
                    </Button>
                    <Button asChild variant="outline">
                      <a href="https://www.bitpay.co.il/" target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Open Bit
                      </a>
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{msg}</div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

