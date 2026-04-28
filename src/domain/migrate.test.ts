import { describe, expect, it } from 'vitest'
import { migrateSessionIfNeeded } from './migrate'

describe('migrateSessionIfNeeded', () => {
  it('migrates legacy session.players[] into rosterAdds + participantIds and removes players field', () => {
    const raw: any = {
      id: 'sess_1',
      title: 'Legacy',
      dateISO: '2026-01-01',
      createdAt: 1,
      updatedAt: 2,
      participantIds: [],
      buyins: {},
      rebuyUnits: {},
      cashouts: {},
      allowDeltaOverride: false,
      audit: [],
      players: [{ name: 'A' }, { id: 'ply_x', name: 'B', phone: '+972' }],
    }

    const { session, rosterAdds, legacyPlayerIds } = migrateSessionIfNeeded(raw)
    expect(rosterAdds).toHaveLength(2)
    expect(legacyPlayerIds).toHaveLength(2)
    expect(session.participantIds).toHaveLength(2)
    expect((session as any).players).toBeUndefined()
  })
})

