import { corsHeaders } from '../_shared/cors.ts'
import { createAuthedClient, createServiceClient } from '../_shared/sb.ts'
import { sendPushToUsers } from '../_shared/push.ts'

function yyyyMmDd(d: Date) {
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authed = createAuthedClient(req)
    const { data: u, error: uErr } = await authed.auth.getUser()
    if (uErr) throw uErr
    if (!u.user) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const body = await req.json()
    const groupId = String(body?.groupId ?? '')
    const title = String(body?.title ?? '').trim()
    const startsAt = Number(body?.startsAt)
    const location = body?.location ? String(body.location).trim() : null

    if (!groupId || !Number.isFinite(startsAt)) {
      return new Response(JSON.stringify({ error: 'groupId and startsAt are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const svc = createServiceClient()

    // must be a member
    const { data: mem, error: memErr } = await svc
      .from('group_members')
      .select('group_id')
      .eq('group_id', groupId)
      .eq('user_id', u.user.id)
      .maybeSingle()
    if (memErr) throw memErr
    if (!mem) return new Response(JSON.stringify({ error: 'Not a group member' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const starts = new Date(startsAt)

    // create an empty ledger session owned by host for now
    const nowIso = new Date().toISOString()
    const { data: session, error: sErr } = await svc
      .from('sessions')
      .insert({
        user_id: u.user.id,
        title: title || 'Group game',
        date_iso: yyyyMmDd(starts),
        allow_delta_override: false,
        created_at: nowIso,
        updated_at: nowIso,
      })
      .select('*')
      .single()
    if (sErr) throw sErr

    const { data: game, error: gErr } = await svc
      .from('games')
      .insert({
        group_id: groupId,
        session_id: session.id,
        title: title || '',
        starts_at: new Date(startsAt).toISOString(),
        location,
        host_user_id: u.user.id,
      })
      .select('*')
      .single()
    if (gErr) throw gErr

    const { data: members, error: mem2Err } = await svc.from('group_members').select('user_id').eq('group_id', groupId)
    if (mem2Err) throw mem2Err

    const memberIds = (members ?? []).map((m: any) => m.user_id)
    const targets = memberIds.filter((x: string) => x !== u.user.id)

    if (targets.length) {
      await svc.from('notifications').insert(
        targets.map((uid: string) => ({
          user_id: uid,
          type: 'new_game',
          title: 'New game',
          body: `A new game was created${location ? ` (${location})` : ''}.`,
          data: { gameId: game.id, groupId },
        })),
      )

      await sendPushToUsers(svc, targets, {
        title: 'Poker Ledger — New game',
        body: 'A new game was created. Tap to RSVP.',
        url: `/game/${game.id}`,
      }).catch(() => {})
    }

    return new Response(JSON.stringify(game), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message ?? e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
