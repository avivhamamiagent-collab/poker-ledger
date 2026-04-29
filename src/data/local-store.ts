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
import { id } from '../domain/ids'
import { createSession } from '../domain/session'
import { deleteSession, getSession, listSessions, putSession } from '../storage/db'
import { deletePlayer, listPlayers, putPlayer } from '../storage/roster'

const LOCAL_USER_ID = 'local-user'
const GROUPS_KEY = 'poker-ledger.local.groups'
const GROUP_MEMBERS_KEY = 'poker-ledger.local.group-members'
const INVITES_KEY = 'poker-ledger.local.group-invites'
const GAMES_KEY = 'poker-ledger.local.games'
const RSVPS_KEY = 'poker-ledger.local.game-rsvps'
const PARTICIPANTS_KEY = 'poker-ledger.local.game-participants'
const NOTIFICATIONS_KEY = 'poker-ledger.local.notifications'

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

function localNotification(title: string, body: string, data?: Record<string, unknown>): AppNotification {
  return {
    id: id('ntf'),
    userId: LOCAL_USER_ID,
    type: 'local',
    title,
    body,
    data,
    createdAt: Date.now(),
  }
}

function addNotification(n: AppNotification): void {
  const items = readJson<AppNotification[]>(NOTIFICATIONS_KEY, [])
  writeJson(NOTIFICATIONS_KEY, [n, ...items].sort((a, b) => b.createdAt - a.createdAt))
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
    return readJson<Group[]>(GROUPS_KEY, []).sort((a, b) => b.updatedAt - a.updatedAt)
  },
  async createGroup(name: string): Promise<Group> {
    const now = Date.now()
    const group: Group = {
      id: id('grp'),
      name: name.trim() || 'קבוצת פוקר',
      createdAt: now,
      updatedAt: now,
      createdBy: LOCAL_USER_ID,
    }
    const groups = readJson<Group[]>(GROUPS_KEY, [])
    writeJson(GROUPS_KEY, [group, ...groups])

    const members = readJson<GroupMember[]>(GROUP_MEMBERS_KEY, [])
    writeJson(GROUP_MEMBERS_KEY, [
      { groupId: group.id, userId: LOCAL_USER_ID, role: 'owner', joinedAt: now },
      ...members,
    ])

    addNotification(localNotification('קבוצה נוצרה', `הקבוצה "${group.name}" מוכנה למשחק הראשון.`, { groupId: group.id }))
    return group
  },
  async getGroup(groupId: string): Promise<Group | undefined> {
    return readJson<Group[]>(GROUPS_KEY, []).find((group) => group.id === groupId)
  },
  async listGroupMembers(groupId: string): Promise<GroupMember[]> {
    return readJson<GroupMember[]>(GROUP_MEMBERS_KEY, []).filter((member) => member.groupId === groupId)
  },
  async inviteGroupMember(groupId: string, email: string): Promise<GroupInvite> {
    const invite: GroupInvite = {
      id: id('inv'),
      groupId,
      email,
      invitedBy: LOCAL_USER_ID,
      status: 'pending',
      createdAt: Date.now(),
    }
    const invites = readJson<GroupInvite[]>(INVITES_KEY, [])
    writeJson(INVITES_KEY, [invite, ...invites])
    addNotification(localNotification('הזמנה נוצרה', `הזמנה מקומית נשמרה עבור ${email}.`, { groupId, inviteId: invite.id }))
    return invite
  },
  async listMyInvites(): Promise<GroupInvite[]> {
    return []
  },
  async respondToInvite(inviteId: string, status: 'accepted' | 'declined'): Promise<void> {
    const now = Date.now()
    const invites = readJson<GroupInvite[]>(INVITES_KEY, [])
    const nextInvites = invites.map((invite) =>
      invite.id === inviteId ? { ...invite, status, respondedAt: now } : invite,
    )
    writeJson(INVITES_KEY, nextInvites)

    const invite = nextInvites.find((item) => item.id === inviteId)
    if (invite && status === 'accepted') {
      const members = readJson<GroupMember[]>(GROUP_MEMBERS_KEY, [])
      const exists = members.some((member) => member.groupId === invite.groupId && member.userId === invite.email)
      if (!exists) {
        writeJson(GROUP_MEMBERS_KEY, [
          { groupId: invite.groupId, userId: invite.email, role: 'member', joinedAt: now },
          ...members,
        ])
      }
    }
  },

  async listGames(groupId: string): Promise<Game[]> {
    return readJson<Game[]>(GAMES_KEY, [])
      .filter((game) => game.groupId === groupId)
      .sort((a, b) => a.startsAt - b.startsAt)
  },
  async createGame(input: { groupId: string; title: string; startsAt: number; location?: string }): Promise<Game> {
    const group = await this.getGroup(input.groupId)
    const session = createSession(input.title || group?.name)
    await putSession({ ...session, dateISO: new Date(input.startsAt).toISOString().slice(0, 10) })

    const now = Date.now()
    const game: Game = {
      id: id('game'),
      groupId: input.groupId,
      sessionId: session.id,
      title: input.title.trim() || group?.name || 'משחק פוקר',
      startsAt: input.startsAt,
      location: input.location,
      hostUserId: LOCAL_USER_ID,
      createdAt: now,
      updatedAt: now,
    }
    const games = readJson<Game[]>(GAMES_KEY, [])
    writeJson(GAMES_KEY, [game, ...games])

    const rsvps = readJson<GameRsvp[]>(RSVPS_KEY, [])
    writeJson(RSVPS_KEY, [{ gameId: game.id, userId: LOCAL_USER_ID, status: 'going', updatedAt: now }, ...rsvps])

    const participants = readJson<GameParticipant[]>(PARTICIPANTS_KEY, [])
    writeJson(PARTICIPANTS_KEY, [
      { gameId: game.id, userId: LOCAL_USER_ID, selectedAt: now, selectedBy: LOCAL_USER_ID },
      ...participants,
    ])

    addNotification(localNotification('משחק חדש נוצר', `נפתח משחק "${game.title}" וגם לדג׳ר מוכן לרישום.`, {
      groupId: game.groupId,
      gameId: game.id,
      sessionId: game.sessionId,
    }))
    return game
  },
  async getGame(gameId: string): Promise<Game | undefined> {
    return readJson<Game[]>(GAMES_KEY, []).find((game) => game.id === gameId)
  },
  async listGameRsvps(gameId: string): Promise<GameRsvp[]> {
    return readJson<GameRsvp[]>(RSVPS_KEY, []).filter((rsvp) => rsvp.gameId === gameId)
  },
  async setMyRsvp(gameId: string, status: GameRsvp['status']): Promise<void> {
    const now = Date.now()
    const rsvps = readJson<GameRsvp[]>(RSVPS_KEY, [])
    const rest = rsvps.filter((rsvp) => !(rsvp.gameId === gameId && rsvp.userId === LOCAL_USER_ID))
    writeJson(RSVPS_KEY, [{ gameId, userId: LOCAL_USER_ID, status, updatedAt: now }, ...rest])
  },
  async listGameParticipants(gameId: string): Promise<GameParticipant[]> {
    return readJson<GameParticipant[]>(PARTICIPANTS_KEY, []).filter((participant) => participant.gameId === gameId)
  },
  async setGameParticipants(gameId: string, userIds: string[]): Promise<void> {
    const now = Date.now()
    const participants = readJson<GameParticipant[]>(PARTICIPANTS_KEY, []).filter(
      (participant) => participant.gameId !== gameId,
    )
    const next = userIds.map((userId) => ({ gameId, userId, selectedAt: now, selectedBy: LOCAL_USER_ID }))
    writeJson(PARTICIPANTS_KEY, [...next, ...participants])
  },

  async listNotifications(): Promise<AppNotification[]> {
    return readJson<AppNotification[]>(NOTIFICATIONS_KEY, []).sort((a, b) => b.createdAt - a.createdAt)
  },
  async markNotificationRead(notificationId: string): Promise<void> {
    const items = readJson<AppNotification[]>(NOTIFICATIONS_KEY, [])
    writeJson(
      NOTIFICATIONS_KEY,
      items.map((item) => (item.id === notificationId ? { ...item, readAt: Date.now() } : item)),
    )
  },

  async ensurePushSubscription(): Promise<void> {
    addNotification(localNotification('Push מקומי', 'במצב מקומי נשמרות התראות בתוך האפליקציה.'))
  },
}
