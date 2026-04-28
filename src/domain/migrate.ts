import type { Player, Session } from './types'
import { id } from './ids'

// Converts older persisted sessions that embed `players[]` into:
// - global roster additions (returned as rosterAdds)
// - session.participantIds[]
export function migrateSessionIfNeeded(raw: any): {
  session: Session
  rosterAdds: Player[]
  legacyPlayerIds?: string[]
} {
  const rosterAdds: Player[] = []
  if (!raw) return { session: raw as Session, rosterAdds }

  if (Array.isArray(raw.players)) {
    const legacyPlayers: Player[] = raw.players

    // Ensure every legacy player has an id.
    const legacyPlayerIds: string[] = legacyPlayers.map((p) => p.id || id('ply'))
    for (let i = 0; i < legacyPlayers.length; i++) {
      const p = legacyPlayers[i]
      if (!p.id) p.id = legacyPlayerIds[i]
      rosterAdds.push({ id: p.id, name: p.name, phone: p.phone })
    }

    const session: Session = {
      ...raw,
      participantIds: legacyPlayerIds,
    }

    // cleanup legacy field
    delete (session as any).players

    return { session, rosterAdds, legacyPlayerIds }
  }

  return { session: raw as Session, rosterAdds }
}
