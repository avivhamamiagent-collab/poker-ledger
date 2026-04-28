import { describe, expect, it } from 'vitest'
import { computeSettlement } from './settlement'

describe('computeSettlement', () => {
  it('settles simple 1 debtor -> 1 creditor', () => {
    const t = computeSettlement([
      { playerId: 'a', net: -100 },
      { playerId: 'b', net: 100 },
    ])
    expect(t).toEqual([{ fromPlayerId: 'a', toPlayerId: 'b', amount: 100 }])
  })

  it('splits debtor across two creditors', () => {
    const t = computeSettlement([
      { playerId: 'a', net: -150 },
      { playerId: 'b', net: 100 },
      { playerId: 'c', net: 50 },
    ])
    expect(t).toEqual([
      { fromPlayerId: 'a', toPlayerId: 'b', amount: 100 },
      { fromPlayerId: 'a', toPlayerId: 'c', amount: 50 },
    ])
  })

  it('handles multiple debtors and creditors', () => {
    const t = computeSettlement([
      { playerId: 'a', net: -70 },
      { playerId: 'b', net: -30 },
      { playerId: 'c', net: 40 },
      { playerId: 'd', net: 60 },
    ])
    // Greedy ordering => a pays d 60, a pays c 10, b pays c 30
    expect(t).toEqual([
      { fromPlayerId: 'a', toPlayerId: 'd', amount: 60 },
      { fromPlayerId: 'a', toPlayerId: 'c', amount: 10 },
      { fromPlayerId: 'b', toPlayerId: 'c', amount: 30 },
    ])
  })
})

