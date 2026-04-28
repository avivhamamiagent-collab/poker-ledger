import type { LedgerStore } from './store-types'
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
import { deleteSession, getSession, listSessions, putSession } from '../storage/db'
import { deletePlayer, listPlayers, putPlayer } from '../storage/roster'

function notSupported(feature: string): never {
  throw new Error(`Not supported in local storage mode: ${feature}. Set VITE_STORAGE=supabase.`)
}

export const localStore: LedgerStore = {
  kind: 'local',

  async listPlayers(): Promise<Player[]> {
    return await listPlayers()
  },
  async putPlayer(p: Player): Promise<void> {
    await putPlayer(p)
  },
  async deletePlayer(id: string): Promise<void> {
    await deletePlayer(id)
  },

  async listSessions(): Promise<Session[]> {
    return await listSessions()
  },
  async getSession(id: string): Promise<Session | undefined> {
    return await getSession(id)
  },
  async putSession(s: Session): Promise<void> {
    await putSession(s)
  },
  async deleteSession(id: string): Promise<void> {
    await deleteSession(id)
  },

  async listGroups(): Promise<Group[]> {
    return notSupported('groups')
  },
  async createGroup(_name: string): Promise<Group> {
    return notSupported('createGroup')
  },
  async getGroup(_id: string): Promise<Group | undefined> {
    return notSupported('getGroup')
  },
  async listGroupMembers(_groupId: string): Promise<GroupMember[]> {
    return notSupported('listGroupMembers')
  },
  async inviteGroupMember(_groupId: string, _email: string): Promise<GroupInvite> {
    return notSupported('inviteGroupMember')
  },
  async listMyInvites(): Promise<GroupInvite[]> {
    return notSupported('listMyInvites')
  },
  async respondToInvite(_inviteId: string, _status: 'accepted' | 'declined'): Promise<void> {
    return notSupported('respondToInvite')
  },

  async listGames(_groupId: string): Promise<Game[]> {
    return notSupported('listGames')
  },
  async createGame(_input: { groupId: string; title: string; startsAt: number; location?: string }): Promise<Game> {
    return notSupported('createGame')
  },
  async getGame(_id: string): Promise<Game | undefined> {
    return notSupported('getGame')
  },
  async listGameRsvps(_gameId: string): Promise<GameRsvp[]> {
    return notSupported('listGameRsvps')
  },
  async setMyRsvp(_gameId: string, _status: GameRsvp['status']): Promise<void> {
    return notSupported('setMyRsvp')
  },
  async listGameParticipants(_gameId: string): Promise<GameParticipant[]> {
    return notSupported('listGameParticipants')
  },
  async setGameParticipants(_gameId: string, _userIds: string[]): Promise<void> {
    return notSupported('setGameParticipants')
  },

  async listNotifications(): Promise<AppNotification[]> {
    return notSupported('listNotifications')
  },
  async markNotificationRead(_id: string): Promise<void> {
    return notSupported('markNotificationRead')
  },

  async ensurePushSubscription(_sub: { endpoint: string; p256dh: string; auth: string; userAgent?: string }): Promise<void> {
    return notSupported('ensurePushSubscription')
  },
}

