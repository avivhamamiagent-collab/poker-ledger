import type {
  AppNotification,
  Game,
  GameParticipant,
  GameRsvp,
  Group,
  GroupInvite,
  GroupMember,
  Player,
  Session,
} from '../domain/types'

export type StorageKind = 'local' | 'supabase'

export interface LedgerStore {
  kind: StorageKind

  // roster
  listPlayers(): Promise<Player[]>
  putPlayer(p: Player): Promise<void>
  deletePlayer(id: string): Promise<void>

  // ledger sessions
  listSessions(): Promise<Session[]>
  getSession(id: string): Promise<Session | undefined>
  putSession(s: Session): Promise<void>
  deleteSession(id: string): Promise<void>

  // groups
  listGroups(): Promise<Group[]>
  createGroup(name: string): Promise<Group>
  getGroup(id: string): Promise<Group | undefined>
  listGroupMembers(groupId: string): Promise<GroupMember[]>
  inviteGroupMember(groupId: string, email: string): Promise<GroupInvite>
  listMyInvites(): Promise<GroupInvite[]>
  respondToInvite(inviteId: string, status: 'accepted' | 'declined'): Promise<void>

  // games
  listGames(groupId: string): Promise<Game[]>
  createGame(input: { groupId: string; title: string; startsAt: number; location?: string }): Promise<Game>
  getGame(id: string): Promise<Game | undefined>
  listGameRsvps(gameId: string): Promise<GameRsvp[]>
  setMyRsvp(gameId: string, status: GameRsvp['status']): Promise<void>
  listGameParticipants(gameId: string): Promise<GameParticipant[]>
  setGameParticipants(gameId: string, userIds: string[]): Promise<void>

  // notifications
  listNotifications(): Promise<AppNotification[]>
  markNotificationRead(id: string): Promise<void>

  // push subscriptions
  ensurePushSubscription(sub: { endpoint: string; p256dh: string; auth: string; userAgent?: string }): Promise<void>
}

