export type Net = {
  playerId: string
  net: number // positive = should receive, negative = owes
}

export type Transfer = {
  fromPlayerId: string
  toPlayerId: string
  amount: number
}

const round2 = (n: number) => Math.round(n * 100) / 100

// Greedy matching (creditors vs debtors) produces minimal number of transfers
// for this single-commodity flow when splitting is allowed.
export function computeSettlement(nets: Net[]): Transfer[] {
  const creditors = nets
    .filter((n) => n.net > 0.000001)
    .map((n) => ({ ...n }))
    .sort((a, b) => b.net - a.net)
  const debtors = nets
    .filter((n) => n.net < -0.000001)
    .map((n) => ({ playerId: n.playerId, net: -n.net })) // store as positive “owed”
    .sort((a, b) => b.net - a.net)

  const transfers: Transfer[] = []
  let i = 0
  let j = 0
  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i]
    const c = creditors[j]
    const amt = Math.min(d.net, c.net)
    const amount = round2(amt)
    if (amount > 0) {
      transfers.push({
        fromPlayerId: d.playerId,
        toPlayerId: c.playerId,
        amount,
      })
    }
    d.net = round2(d.net - amt)
    c.net = round2(c.net - amt)
    if (d.net <= 0.000001) i++
    if (c.net <= 0.000001) j++
  }
  return transfers
}

