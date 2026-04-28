export type Id = string

export type Player = {
  id: Id
  name: string
  phone?: string
}

export type AuditEvent = {
  id: Id
  ts: number
  type:
    | 'session_created'
    | 'player_added'
    | 'player_updated'
    | 'player_removed'
    | 'buyin_set'
    | 'rebuy_units_added'
    | 'rebuy_units_set'
    | 'cashout_set'
    | 'override_delta_set'
  message: string
}

export type Session = {
  id: Id
  title: string
  dateISO: string // yyyy-mm-dd
  createdAt: number
  updatedAt: number

  // Legacy (v0): players were stored inside the session. Kept optional for migration.
  players?: Player[]

  participantIds: Id[]

  // amounts in ILS
  buyins: Record<Id, number>
  // rebuy “units” where 1 unit = 50₪
  rebuyUnits: Record<Id, number>
  cashouts: Record<Id, number>

  allowDeltaOverride: boolean

  audit: AuditEvent[]
}

export const REBUY_UNIT_ILS = 50

// --- Multi-user groups + games (MVP) ---

export type GroupRole = 'owner' | 'member'

export type Group = {
  id: Id
  name: string
  createdAt: number
  updatedAt: number
  createdBy: Id
}

export type GroupMember = {
  groupId: Id
  userId: Id
  role: GroupRole
  joinedAt: number
}

export type GroupInviteStatus = 'pending' | 'accepted' | 'declined'

export type GroupInvite = {
  id: Id
  groupId: Id
  email: string
  invitedBy: Id
  status: GroupInviteStatus
  createdAt: number
  respondedAt?: number
}

export type GameRsvpStatus = 'going' | 'interested' | 'no'

export type Game = {
  id: Id
  groupId: Id
  sessionId: Id
  title: string
  startsAt: number // epoch ms
  location?: string
  hostUserId: Id
  createdAt: number
  updatedAt: number
}

export type GameRsvp = {
  gameId: Id
  userId: Id
  status: GameRsvpStatus
  updatedAt: number
}

export type GameParticipant = {
  gameId: Id
  userId: Id
  selectedAt: number
  selectedBy: Id
}

export type AppNotification = {
  id: Id
  userId: Id
  type: string
  title: string
  body: string
  data?: Record<string, unknown>
  createdAt: number
  readAt?: number
}
