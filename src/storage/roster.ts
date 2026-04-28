import type { Player } from '../domain/types'
import { dbp, PLAYERS } from './db'

export async function listPlayers(): Promise<Player[]> {
  const db = await dbp
  const all = (await db.getAll(PLAYERS)) as Player[]
  return all.sort((a, b) => a.name.localeCompare(b.name))
}

export async function putPlayer(p: Player): Promise<void> {
  const db = await dbp
  await db.put(PLAYERS, p)
}

export async function deletePlayer(id: string): Promise<void> {
  const db = await dbp
  await db.delete(PLAYERS, id)
}

// Backwards-compatible aliases
export const listRoster = listPlayers
export const putRosterPlayer = putPlayer
export const deleteRosterPlayer = deletePlayer
