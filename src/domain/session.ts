import { id, todayISO } from './ids'
import type { AuditEvent, Session } from './types'
import { REBUY_UNIT_ILS } from './types'

function audit(type: AuditEvent['type'], message: string): AuditEvent {
  return { id: id('evt'), ts: Date.now(), type, message }
}

export function createSession(title?: string): Session {
  const now = Date.now()
  const dateISO = todayISO()
  const s: Session = {
    id: id('sess'),
    title: title?.trim() || `Poker night ${dateISO}`,
    dateISO,
    createdAt: now,
    updatedAt: now,
    participantIds: [],
    buyins: {},
    rebuyUnits: {},
    cashouts: {},
    allowDeltaOverride: false,
    audit: [audit('session_created', 'Session created')],
  }
  return s
}

export function totalBuyinForPlayer(s: Session, playerId: string): number {
  const buyin = s.buyins[playerId] || 0
  const units = s.rebuyUnits[playerId] || 0
  return buyin + units * REBUY_UNIT_ILS
}

export function totalBuyins(s: Session): number {
  return s.participantIds.reduce((sum, pid) => sum + totalBuyinForPlayer(s, pid), 0)
}

export function totalCashouts(s: Session): number {
  return s.participantIds.reduce((sum, pid) => sum + (s.cashouts[pid] || 0), 0)
}

export function delta(s: Session): number {
  return totalCashouts(s) - totalBuyins(s)
}

export function addParticipant(s: Session, playerId: string, playerNameForAudit?: string): Session {
  if (s.participantIds.includes(playerId)) return s
  const next: Session = {
    ...s,
    updatedAt: Date.now(),
    participantIds: [...s.participantIds, playerId],
    audit: [...s.audit, audit('player_added', `Added player: ${playerNameForAudit || playerId}`)],
  }
  return next
}

export function removeParticipant(s: Session, playerId: string, playerNameForAudit?: string): Session {
  const name = playerNameForAudit || playerId
  const { [playerId]: _, ...buyins } = s.buyins
  const { [playerId]: __, ...cashouts } = s.cashouts
  const { [playerId]: ___, ...rebuyUnits } = s.rebuyUnits
  const next: Session = {
    ...s,
    updatedAt: Date.now(),
    participantIds: s.participantIds.filter((id) => id !== playerId),
    buyins,
    cashouts,
    rebuyUnits,
    audit: [...s.audit, audit('player_removed', `Removed player: ${name}`)],
  }
  return next
}

export function setBuyin(s: Session, playerId: string, amount: number, playerNameForAudit?: string): Session {
  const name = playerNameForAudit || playerId
  const next: Session = {
    ...s,
    updatedAt: Date.now(),
    buyins: { ...s.buyins, [playerId]: amount },
    audit: [...s.audit, audit('buyin_set', `Set buy-in for ${name}: ₪${amount}`)],
  }
  return next
}

export function addRebuyUnits(
  s: Session,
  playerId: string,
  unitsToAdd: number,
  playerNameForAudit?: string,
): Session {
  const name = playerNameForAudit || playerId
  const cur = s.rebuyUnits[playerId] || 0
  const nextUnits = cur + unitsToAdd
  const next: Session = {
    ...s,
    updatedAt: Date.now(),
    rebuyUnits: { ...s.rebuyUnits, [playerId]: nextUnits },
    audit: [...s.audit, audit('rebuy_units_added', `Added ${unitsToAdd} rebuy units to ${name} (now ${nextUnits})`)],
  }
  return next
}

export function setRebuyUnits(s: Session, playerId: string, units: number, playerNameForAudit?: string): Session {
  const name = playerNameForAudit || playerId
  const next: Session = {
    ...s,
    updatedAt: Date.now(),
    rebuyUnits: { ...s.rebuyUnits, [playerId]: units },
    audit: [...s.audit, audit('rebuy_units_set', `Set rebuy units for ${name}: ${units}`)],
  }
  return next
}

export function setCashout(s: Session, playerId: string, amount: number, playerNameForAudit?: string): Session {
  const name = playerNameForAudit || playerId
  const next: Session = {
    ...s,
    updatedAt: Date.now(),
    cashouts: { ...s.cashouts, [playerId]: amount },
    audit: [...s.audit, audit('cashout_set', `Set cashout for ${name}: ₪${amount}`)],
  }
  return next
}

export function setAllowDeltaOverride(s: Session, allow: boolean): Session {
  const next: Session = {
    ...s,
    updatedAt: Date.now(),
    allowDeltaOverride: allow,
    audit: [...s.audit, audit('override_delta_set', `Delta override: ${allow ? 'ON' : 'OFF'}`)],
  }
  return next
}
