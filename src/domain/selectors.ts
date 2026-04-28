import type { Player, Session } from './types'
import { totalBuyinForPlayer } from './session'

export function participantsForSession(s: Session, roster: Player[]): Player[] {
  const byId = new Map(roster.map((p) => [p.id, p] as const))
  return s.participantIds.map((pid) => byId.get(pid) || { id: pid, name: pid })
}

export function netForPlayer(s: Session, playerId: string): number {
  return (s.cashouts[playerId] || 0) - totalBuyinForPlayer(s, playerId)
}

