import type { Player } from './types'

function norm(s: string | undefined): string {
  return (s || '').trim().toLowerCase()
}

function normPhone(s: string | undefined): string {
  return norm(s).replace(/[^0-9+]/g, '')
}

export function rosterKey(p: Pick<Player, 'name' | 'phone'>): string {
  return `${norm(p.name)}|${normPhone(p.phone)}`
}

