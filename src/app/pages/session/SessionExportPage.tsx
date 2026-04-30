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
  lines.push(`סיכום ערב פוקר — ${s.dateISO}`)
  lines.push(s.title || 'ערב פוקר')
  lines.push('')
  lines.push('שחקנים:')
  for (const pid of s.participantIds) {
    const name = playerName(roster, pid)
    const buyin = s.buyins[pid] || 0
    const units = s.rebuyUnits[pid] || 0
    const cashout = s.cashouts[pid] || 0
    const total = totalBuyinForPlayer(s, pid)
    const net = cashout - total
    lines.push(
      `- ${name}: כניסה ${ils(buyin)}, ריבאיים ${units}×${ils(REBUY_UNIT_ILS)} (= ${ils(units * REBUY_UNIT_ILS)}), סה"כ ${ils(
        total,
      )}, קאשאאוט ${ils(cashout)}, נטו ${ils(net)}`,
    )
  }
  lines.push('')
  lines.push(`סה"כ כניסות: ${ils(totalBuyins(s))}`)
  lines.push(`סה"כ קאשאאוט: ${ils(totalCashouts(s))}`)
  lines.push(`הפרש: ${ils(delta(s))}`)
  lines.push('')
  lines.push('העברות:')
  if (transfers.length === 0) {
    lines.push('- אין העברות')
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
          <CardTitle>טוען…</CardTitle>
        </CardHeader>
      </Card>
    )
  }
  if (error || !session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>לא הצלחנו לטעון ייצוא</CardTitle>
          {error && <CardDescription>{error}</CardDescription>}
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>שיתוף סיכום</CardTitle>
        <CardDescription>אפשר להעתיק לוואטסאפ/טלגרם או לשתף ישירות מהמכשיר.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={async () => {
              await copyText(text)
              toast.push({ title: 'הועתק', description: 'סיכום הערב הועתק ללוח.' })
            }}
          >
            העתק סיכום
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              const nav = navigator as unknown as { share?: (data: { text: string }) => Promise<void> }
              if (nav.share) {
                await nav.share({ text })
              } else {
                await copyText(text)
                toast.push({ title: 'הועתק', description: 'שיתוף ישיר לא נתמך במכשיר הזה.' })
              }
            }}
          >
            שיתוף…
          </Button>
        </div>

        <textarea
          className="min-h-[240px] w-full resize-y rounded-xl border border-tertiary/18 bg-surface-container-high/70 p-3 text-sm text-on-surface"
          readOnly
          value={text}
        />
      </CardContent>
    </Card>
  )
}
