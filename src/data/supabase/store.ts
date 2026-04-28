import type { LedgerStore } from '../store-types'
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
} from '../../domain/types'
import { supabase } from './client'

function toIsoDate(dateISO: string): string {
  // already yyyy-mm-dd
  return dateISO
}

async function requireUserId(): Promise<string> {
  const sb = supabase()
  const { data, error } = await sb.auth.getUser()
  if (error) throw error
  if (!data.user) throw new Error('Not authenticated')
  return data.user.id
}

function ms(ts: string | number | Date): number {
  return new Date(ts).getTime()
}

export const supabaseStore: LedgerStore = {
  kind: 'supabase',

  // --- roster ---
  async listPlayers(): Promise<Player[]> {
    const sb = supabase()
    const userId = await requireUserId()
    const { data, error } = await sb
      .from('players')
      .select('id,name,phone,created_at,updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((r) => ({ id: r.id, name: r.name, phone: r.phone ?? undefined }))
  },

  async putPlayer(p: Player): Promise<void> {
    const sb = supabase()
    const userId = await requireUserId()
    const { error } = await sb.from('players').upsert(
      {
        id: p.id,
        user_id: userId,
        name: p.name,
        phone: p.phone ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    )
    if (error) throw error
  },

  async deletePlayer(id: string): Promise<void> {
    const sb = supabase()
    const userId = await requireUserId()
    const { error } = await sb.from('players').delete().eq('id', id).eq('user_id', userId)
    if (error) throw error
  },

  // --- sessions (ledger) ---
  async listSessions(): Promise<Session[]> {
    const sb = supabase()
    const userId = await requireUserId()

    const { data: sessions, error } = await sb
      .from('sessions')
      .select('id,title,date_iso,allow_delta_override,created_at,updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
    if (error) throw error

    const ids = (sessions ?? []).map((s) => s.id)
    if (ids.length === 0) return []

    const [{ data: parts, error: partsErr }, { data: entries, error: entErr }, { data: audits, error: audErr }] =
      await Promise.all([
        sb.from('session_participants').select('session_id,player_id').in('session_id', ids),
        sb
          .from('ledger_entries')
          .select('session_id,player_id,type,amount_ils,rebuy_units')
          .in('session_id', ids)
          .eq('user_id', userId),
        sb.from('audit_events').select('session_id,id,ts,type,message').in('session_id', ids).eq('user_id', userId),
      ])
    if (partsErr) throw partsErr
    if (entErr) throw entErr
    if (audErr) throw audErr

    const partsBySession = new Map<string, string[]>()
    for (const p of parts ?? []) {
      const arr = partsBySession.get(p.session_id) ?? []
      arr.push(p.player_id)
      partsBySession.set(p.session_id, arr)
    }

    type Totals = { buyins: Record<string, number>; cashouts: Record<string, number>; rebuyUnits: Record<string, number> }
    const totalsBySession = new Map<string, Totals>()
    for (const e of entries ?? []) {
      const t = totalsBySession.get(e.session_id) ?? { buyins: {}, cashouts: {}, rebuyUnits: {} }
      if (e.type === 'buyin') t.buyins[e.player_id] = e.amount_ils ?? 0
      if (e.type === 'cashout') t.cashouts[e.player_id] = e.amount_ils ?? 0
      if (e.type === 'rebuy_units') t.rebuyUnits[e.player_id] = e.rebuy_units ?? 0
      totalsBySession.set(e.session_id, t)
    }

    const auditsBySession = new Map<string, Session['audit']>()
    for (const a of audits ?? []) {
      const arr = auditsBySession.get(a.session_id) ?? []
      arr.push({ id: a.id, ts: ms(a.ts), type: a.type as any, message: a.message })
      auditsBySession.set(a.session_id, arr)
    }

    return (sessions ?? []).map((s) => {
      const parts = partsBySession.get(s.id) ?? []
      const t = totalsBySession.get(s.id) ?? { buyins: {}, cashouts: {}, rebuyUnits: {} }
      return {
        id: s.id,
        title: s.title,
        dateISO: toIsoDate(s.date_iso),
        createdAt: ms(s.created_at),
        updatedAt: ms(s.updated_at),
        participantIds: parts,
        buyins: t.buyins,
        rebuyUnits: t.rebuyUnits,
        cashouts: t.cashouts,
        allowDeltaOverride: s.allow_delta_override,
        audit: (auditsBySession.get(s.id) ?? []).sort((a, b) => a.ts - b.ts),
      }
    })
  },

  async getSession(id: string): Promise<Session | undefined> {
    const sb = supabase()
    const userId = await requireUserId()

    const { data: s, error } = await sb
      .from('sessions')
      .select('id,title,date_iso,allow_delta_override,created_at,updated_at')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle()
    if (error) throw error
    if (!s) return undefined

    const [{ data: parts, error: partsErr }, { data: entries, error: entErr }, { data: audits, error: audErr }] =
      await Promise.all([
        sb.from('session_participants').select('player_id').eq('session_id', id),
        sb.from('ledger_entries').select('player_id,type,amount_ils,rebuy_units').eq('session_id', id).eq('user_id', userId),
        sb.from('audit_events').select('id,ts,type,message').eq('session_id', id).eq('user_id', userId),
      ])
    if (partsErr) throw partsErr
    if (entErr) throw entErr
    if (audErr) throw audErr

    const buyins: Record<string, number> = {}
    const cashouts: Record<string, number> = {}
    const rebuyUnits: Record<string, number> = {}

    for (const e of entries ?? []) {
      if (e.type === 'buyin') buyins[e.player_id] = e.amount_ils ?? 0
      if (e.type === 'cashout') cashouts[e.player_id] = e.amount_ils ?? 0
      if (e.type === 'rebuy_units') rebuyUnits[e.player_id] = e.rebuy_units ?? 0
    }

    return {
      id: s.id,
      title: s.title,
      dateISO: toIsoDate(s.date_iso),
      createdAt: ms(s.created_at),
      updatedAt: ms(s.updated_at),
      participantIds: (parts ?? []).map((p) => p.player_id),
      buyins,
      cashouts,
      rebuyUnits,
      allowDeltaOverride: s.allow_delta_override,
      audit: (audits ?? []).map((a) => ({ id: a.id, ts: ms(a.ts), type: a.type as any, message: a.message })),
    }
  },

  async putSession(s: Session): Promise<void> {
    const sb = supabase()
    const userId = await requireUserId()

    const { error: upErr } = await sb.from('sessions').upsert(
      {
        id: s.id,
        user_id: userId,
        title: s.title,
        date_iso: s.dateISO,
        allow_delta_override: s.allowDeltaOverride,
        created_at: new Date(s.createdAt).toISOString(),
        updated_at: new Date(s.updatedAt).toISOString(),
      },
      { onConflict: 'id' },
    )
    if (upErr) throw upErr

    // overwrite child tables for simplicity
    const [{ error: delPartsErr }, { error: delEntErr }, { error: delAudErr }] = await Promise.all([
      sb.from('session_participants').delete().eq('session_id', s.id),
      sb.from('ledger_entries').delete().eq('session_id', s.id).eq('user_id', userId),
      sb.from('audit_events').delete().eq('session_id', s.id).eq('user_id', userId),
    ])
    if (delPartsErr) throw delPartsErr
    if (delEntErr) throw delEntErr
    if (delAudErr) throw delAudErr

    if (s.participantIds.length) {
      const { error: insErr } = await sb.from('session_participants').insert(
        s.participantIds.map((pid) => ({ session_id: s.id, player_id: pid })),
      )
      if (insErr) throw insErr
    }

    const ledgerRows: any[] = []
    for (const [pid, v] of Object.entries(s.buyins)) ledgerRows.push({ user_id: userId, session_id: s.id, player_id: pid, type: 'buyin', amount_ils: v })
    for (const [pid, v] of Object.entries(s.cashouts)) ledgerRows.push({ user_id: userId, session_id: s.id, player_id: pid, type: 'cashout', amount_ils: v })
    for (const [pid, v] of Object.entries(s.rebuyUnits)) ledgerRows.push({ user_id: userId, session_id: s.id, player_id: pid, type: 'rebuy_units', rebuy_units: v })

    if (ledgerRows.length) {
      const { error: insLedErr } = await sb.from('ledger_entries').insert(ledgerRows)
      if (insLedErr) throw insLedErr
    }

    if (s.audit.length) {
      const { error: insAudErr } = await sb.from('audit_events').insert(
        s.audit.map((a) => ({
          id: a.id,
          user_id: userId,
          session_id: s.id,
          ts: new Date(a.ts).toISOString(),
          type: a.type,
          message: a.message,
        })),
      )
      if (insAudErr) throw insAudErr
    }
  },

  async deleteSession(id: string): Promise<void> {
    const sb = supabase()
    const userId = await requireUserId()
    const { error } = await sb.from('sessions').delete().eq('id', id).eq('user_id', userId)
    if (error) throw error
  },

  // --- groups ---
  async listGroups(): Promise<Group[]> {
    const sb = supabase()
    const userId = await requireUserId()

    const { data: mem, error: memErr } = await sb.from('group_members').select('group_id').eq('user_id', userId)
    if (memErr) throw memErr
    const groupIds = (mem ?? []).map((m) => m.group_id)
    if (groupIds.length === 0) return []

    const { data, error } = await sb
      .from('groups')
      .select('id,name,created_at,updated_at,created_by')
      .in('id', groupIds)
      .order('updated_at', { ascending: false })
    if (error) throw error

    return (data ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      createdAt: ms(g.created_at),
      updatedAt: ms(g.updated_at),
      createdBy: g.created_by,
    }))
  },

  async createGroup(name: string): Promise<Group> {
    const sb = supabase()
    const userId = await requireUserId()

    const { data, error } = await sb.functions.invoke('create-group', { body: { name } })
    if (error) throw error
    const g = data as any
    return { id: g.id, name: g.name, createdAt: ms(g.created_at), updatedAt: ms(g.updated_at), createdBy: g.created_by ?? userId }
  },

  async getGroup(id: string): Promise<Group | undefined> {
    const sb = supabase()
    const { data, error } = await sb.from('groups').select('id,name,created_at,updated_at,created_by').eq('id', id).maybeSingle()
    if (error) throw error
    if (!data) return undefined
    return { id: data.id, name: data.name, createdAt: ms(data.created_at), updatedAt: ms(data.updated_at), createdBy: data.created_by }
  },

  async listGroupMembers(groupId: string): Promise<GroupMember[]> {
    const sb = supabase()
    const { data, error } = await sb.from('group_members').select('group_id,user_id,role,joined_at').eq('group_id', groupId)
    if (error) throw error
    return (data ?? []).map((m) => ({ groupId: m.group_id, userId: m.user_id, role: m.role, joinedAt: ms(m.joined_at) }))
  },

  async inviteGroupMember(groupId: string, email: string): Promise<GroupInvite> {
    const sb = supabase()
    const { data, error } = await sb.functions.invoke('invite-member', { body: { groupId, email } })
    if (error) throw error
    const inv = data as any
    return { id: inv.id, groupId: inv.group_id, email: inv.email, invitedBy: inv.invited_by, status: inv.status, createdAt: ms(inv.created_at), respondedAt: inv.responded_at ? ms(inv.responded_at) : undefined }
  },

  async listMyInvites(): Promise<GroupInvite[]> {
    const sb = supabase()
    const { data, error } = await sb.from('group_invites').select('id,group_id,email,invited_by,status,created_at,responded_at').order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((inv) => ({ id: inv.id, groupId: inv.group_id, email: inv.email, invitedBy: inv.invited_by, status: inv.status, createdAt: ms(inv.created_at), respondedAt: inv.responded_at ? ms(inv.responded_at) : undefined }))
  },

  async respondToInvite(inviteId: string, status: 'accepted' | 'declined'): Promise<void> {
    const sb = supabase()
    const { error } = await sb.functions.invoke('respond-invite', { body: { inviteId, status } })
    if (error) throw error
  },

  // --- games ---
  async listGames(groupId: string): Promise<Game[]> {
    const sb = supabase()
    const { data, error } = await sb
      .from('games')
      .select('id,group_id,session_id,title,starts_at,location,host_user_id,created_at,updated_at')
      .eq('group_id', groupId)
      .order('starts_at', { ascending: true })
    if (error) throw error
    return (data ?? []).map((g) => ({
      id: g.id,
      groupId: g.group_id,
      sessionId: g.session_id,
      title: g.title,
      startsAt: ms(g.starts_at),
      location: g.location ?? undefined,
      hostUserId: g.host_user_id,
      createdAt: ms(g.created_at),
      updatedAt: ms(g.updated_at),
    }))
  },

  async createGame(input: { groupId: string; title: string; startsAt: number; location?: string }): Promise<Game> {
    const sb = supabase()
    const { data, error } = await sb.functions.invoke('create-game', { body: input })
    if (error) throw error
    const g = data as any
    return {
      id: g.id,
      groupId: g.group_id,
      sessionId: g.session_id,
      title: g.title,
      startsAt: ms(g.starts_at),
      location: g.location ?? undefined,
      hostUserId: g.host_user_id,
      createdAt: ms(g.created_at),
      updatedAt: ms(g.updated_at),
    }
  },

  async getGame(id: string): Promise<Game | undefined> {
    const sb = supabase()
    const { data, error } = await sb
      .from('games')
      .select('id,group_id,session_id,title,starts_at,location,host_user_id,created_at,updated_at')
      .eq('id', id)
      .maybeSingle()
    if (error) throw error
    if (!data) return undefined
    return {
      id: data.id,
      groupId: data.group_id,
      sessionId: data.session_id,
      title: data.title,
      startsAt: ms(data.starts_at),
      location: data.location ?? undefined,
      hostUserId: data.host_user_id,
      createdAt: ms(data.created_at),
      updatedAt: ms(data.updated_at),
    }
  },

  async listGameRsvps(gameId: string): Promise<GameRsvp[]> {
    const sb = supabase()
    const { data, error } = await sb.from('game_rsvps').select('game_id,user_id,status,updated_at').eq('game_id', gameId)
    if (error) throw error
    return (data ?? []).map((r) => ({ gameId: r.game_id, userId: r.user_id, status: r.status, updatedAt: ms(r.updated_at) }))
  },

  async setMyRsvp(gameId: string, status: GameRsvp['status']): Promise<void> {
    const sb = supabase()
    const { error } = await sb.functions.invoke('set-rsvp', { body: { gameId, status } })
    if (error) throw error
  },

  async listGameParticipants(gameId: string): Promise<GameParticipant[]> {
    const sb = supabase()
    const { data, error } = await sb.from('game_participants').select('game_id,user_id,selected_at,selected_by').eq('game_id', gameId)
    if (error) throw error
    return (data ?? []).map((p) => ({ gameId: p.game_id, userId: p.user_id, selectedAt: ms(p.selected_at), selectedBy: p.selected_by }))
  },

  async setGameParticipants(gameId: string, userIds: string[]): Promise<void> {
    const sb = supabase()
    const { error } = await sb.functions.invoke('set-participants', { body: { gameId, userIds } })
    if (error) throw error
  },

  // --- notifications ---
  async listNotifications(): Promise<AppNotification[]> {
    const sb = supabase()
    const userId = await requireUserId()
    const { data, error } = await sb
      .from('notifications')
      .select('id,user_id,type,title,body,data,created_at,read_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    return (data ?? []).map((n) => ({
      id: n.id,
      userId: n.user_id,
      type: n.type,
      title: n.title,
      body: n.body,
      data: (n.data ?? undefined) as any,
      createdAt: ms(n.created_at),
      readAt: n.read_at ? ms(n.read_at) : undefined,
    }))
  },

  async markNotificationRead(id: string): Promise<void> {
    const sb = supabase()
    const userId = await requireUserId()
    const { error } = await sb.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id).eq('user_id', userId)
    if (error) throw error
  },

  // --- push subscriptions ---
  async ensurePushSubscription(sub: { endpoint: string; p256dh: string; auth: string; userAgent?: string }): Promise<void> {
    const sb = supabase()
    const userId = await requireUserId()
    const { error } = await sb.from('push_subscriptions').upsert(
      {
        user_id: userId,
        endpoint: sub.endpoint,
        p256dh: sub.p256dh,
        auth: sub.auth,
        user_agent: sub.userAgent ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,endpoint' },
    )
    if (error) throw error
  },
}

