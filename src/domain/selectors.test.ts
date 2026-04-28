import { describe, expect, it } from 'vitest'
import type { Session } from './types'
import { netForPlayer } from './selectors'

describe('netForPlayer', () => {
  it('cashout - (buyin + rebuyUnits*unit)', () => {
    const s: Session = {
      id: 'sess',
      title: 't',
      dateISO: '2026-01-01',
      createdAt: 1,
      updatedAt: 1,
      participantIds: ['p1'],
      buyins: { p1: 100 },
      rebuyUnits: { p1: 2 }, // 2*50 = 100
      cashouts: { p1: 260 },
      allowDeltaOverride: false,
      audit: [],
    }
    expect(netForPlayer(s, 'p1')).toBe(60)
  })
})

