import * as React from 'react'

import type { Player, Session } from '../../../domain/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { useRoster } from '../../hooks/useRoster'
import { useSession } from '../../hooks/useSession'
import { computeSettlement } from '../../../domain/settlement'
import { delta, totalBuyinForPlayer, totalBuyins, totalCashouts } from '../../../domain/session'
import { REBUY_UNIT_ILS } from '../../../domain/types'
import { ils } from '../../../lib/money'
import { copyText } from '../../../lib/clipboard'
import { useToast } from '../../../components/ui/use-toast'

function playerName(roster: Player[], playerId: string) {
  return roster.find((p) => p.id === playerId)?.name || playerId
}

function buildSummary(s: Session, roster: Player[], transfers: { fromPlayerId: string; toPlayerId: string; amount: number }[]): string {
  const lines: string[] = []
  lines.push(`Poker night — ${s.dateISO}`)
  lines.push(s.title)
  lines.push('')
  lines.push('Players:')
  for (const pid of s.participantIds) {
    const name = playerName(roster, pid)
    const buyin = s.buyins[pid] || 0
    const units = s.rebuyUnits[pid] || 0
    const cashout = s.cashouts[pid] || 0
    const total = totalBuyinForPlayer(s, pid)
    const net = cashout - total
    lines.push(
      `- ${name}: buy-in ${ils(buyin)}, rebuys ${units}×${ils(REBUY_UNIT_ILS)} (= ${ils(units * REBUY_UNIT_ILS)}), total ${ils(
        total,
      )}, cashout ${ils(cashout)}, net ${ils(net)}`,
    )
  }
  lines.push('')
  lines.push(`Total buy-ins: ${ils(totalBuyins(s))}`)
  lines.push(`Total cashouts: ${ils(totalCashouts(s))}`)
  lines.push(`Delta: ${ils(delta(s))}`)
  lines.push('')
  lines.push('Settlement:')
  if (transfers.length === 0) {
    lines.push('- No transfers')
  } else {
    for (const t of transfers) {
      lines.push(`- ${playerName(roster, t.fromPlayerId)} → ${playerName(roster, t.toPlayerId)}: ${ils(t.amount)}`)
    }
  }
  return lines.join('\n')
}

export function SessionExportPage() {
  const toast = useToast()
  const { roster } = useRoster()
  const { session, loading, error } = useSession()

  const text = React.useMemo(() => {
    if (!session) return ''
    const transfers = computeSettlement(
      session.participantIds.map((pid) => ({
        playerId: pid,
        net: (session.cashouts[pid] || 0) - totalBuyinForPlayer(session, pid),
      })),
    )
    return buildSummary(session, roster, transfers)
  }, [session, roster])

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
          <CardTitle>Couldn’t load export</CardTitle>
          {error && <CardDescription>{error}</CardDescription>}
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Share / Export</CardTitle>
        <CardDescription>Copy the summary to WhatsApp/Telegram, or use native share.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={async () => {
              await copyText(text)
              toast.push({ title: 'Copied', description: 'Summary copied to clipboard.' })
            }}
          >
            Copy summary
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const nav: any = navigator
              if (nav.share) {
                await nav.share({ text })
              } else {
                await copyText(text)
                toast.push({ title: 'Copied', description: 'Native share not supported here.' })
              }
            }}
          >
            Share…
          </Button>
        </div>

        <textarea
          className="min-h-[240px] w-full resize-y rounded-xl border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
          readOnly
          value={text}
        />
      </CardContent>
    </Card>
  )
}

