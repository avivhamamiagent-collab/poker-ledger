import { openDB } from 'idb'
import type { Player, Session } from '../domain/types'
import { migrateSessionIfNeeded } from '../domain/migrate'

const DB_NAME = 'poker-ledger'
const DB_VERSION = 2
const SESSIONS = 'sessions'
const PLAYERS = 'players'

export const dbp = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(SESSIONS)) {
      db.createObjectStore(SESSIONS, { keyPath: 'id' })
    }
    if (!db.objectStoreNames.contains(PLAYERS)) {
      db.createObjectStore(PLAYERS, { keyPath: 'id' })
    }
  },
})

function norm(s: string | undefined): string {
  return (s || '').trim().toLowerCase()
}

function normPhone(s: string | undefined): string {
  return norm(s).replace(/[^0-9+]/g, '')
}

function playerKey(p: Pick<Player, 'name' | 'phone'>): string {
  return `${norm(p.name)}|${normPhone(p.phone)}`
}

function remapRecord<T extends Record<string, number>>(r: T, idMap: Record<string, string>): T {
  const out: Record<string, number> = {}
  for (const [k, v] of Object.entries(r || {})) {
    const nk = idMap[k] || k
    out[nk] = v
  }
  return out as T
}

async function applyMigration(raw: any): Promise<Session> {
  const { session, rosterAdds, legacyPlayerIds } = migrateSessionIfNeeded(raw)
  if (rosterAdds.length === 0) return session

  const db = await dbp
  const existing = (await db.getAll(PLAYERS)) as Player[]
  const byKey = new Map<string, Player>()
  for (const p of existing) byKey.set(playerKey(p), p)

  const idMap: Record<string, string> = {}

  for (const p of rosterAdds) {
    const key = playerKey(p)
    const found = byKey.get(key)
    if (found) {
      idMap[p.id] = found.id
    } else {
      await db.put(PLAYERS, p)
      byKey.set(key, p)
    }
  }

  // If we migrated legacy players, align participantIds and remap any numeric maps.
  if (legacyPlayerIds && legacyPlayerIds.length > 0) {
    const desired = legacyPlayerIds.map((oldId) => idMap[oldId] || oldId)
    const dedupDesired = Array.from(new Set(desired))

    const participantIds =
      Array.isArray(session.participantIds) && session.participantIds.length > 0
        ? session.participantIds.map((pid) => idMap[pid] || pid)
        : dedupDesired

    const next: Session = {
      ...session,
      participantIds: Array.from(new Set(participantIds)),
      buyins: remapRecord(session.buyins, idMap),
      cashouts: remapRecord(session.cashouts, idMap),
      rebuyUnits: remapRecord(session.rebuyUnits, idMap),
      updatedAt: Date.now(),
    }
    await db.put(SESSIONS, next)
    return next
  }

  // Roster additions only.
  return session
}

export async function listSessions(): Promise<Session[]> {
  const db = await dbp
  const all = await db.getAll(SESSIONS)
  const migrated = await Promise.all(all.map(applyMigration))
  return (migrated as Session[]).sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getSession(id: string): Promise<Session | undefined> {
  const db = await dbp
  const raw = await db.get(SESSIONS, id)
  if (!raw) return undefined
  return await applyMigration(raw)
}

export async function putSession(s: Session): Promise<void> {
  const db = await dbp
  await db.put(SESSIONS, s)
}

export async function deleteSession(id: string): Promise<void> {
  const db = await dbp
  await db.delete(SESSIONS, id)
}

export { PLAYERS }
