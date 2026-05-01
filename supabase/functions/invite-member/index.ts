import { corsHeaders } from '../_shared/cors.ts'
import { createAuthedClient, createServiceClient } from '../_shared/sb.ts'
import { sendPushToUsers } from '../_shared/push.ts'

async function findUserIdByEmail(svc: any, email: string): Promise<string | null> {
  // Use profiles table (kept in sync via on_auth_user_created trigger).
  // O(1) indexed lookup, no scanning.
  const { data, error } = await svc
    .from('profiles')
    .select('id')
    .ilike('email', email)
    .maybeSingle()
  if (error) throw error
  return data?.id ?? null
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
    const email = String(body?.email ?? '').trim()
    if (!groupId || !email) return new Response(JSON.stringify({ error: 'groupId and email are required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const svc = createServiceClient()

    // must be a member to invite
    const { data: mem, error: memErr } = await svc
      .from('group_members')
      .select('group_id')
      .eq('group_id', groupId)
      .eq('user_id', u.user.id)
      .maybeSingle()
    if (memErr) throw memErr
    if (!mem) return new Response(JSON.stringify({ error: 'Not a group member' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const { data: inv, error: invErr } = await svc
      .from('group_invites')
      .insert({ group_id: groupId, email, invited_by: u.user.id, status: 'pending' })
      .select('*')
      .single()
    if (invErr) throw invErr

    // If the invited user already exists, notify them.
    const invitedUserId = await findUserIdByEmail(svc, email).catch(() => null)
    if (invitedUserId) {
      await svc.from('notifications').insert({
        user_id: invitedUserId,
        type: 'group_invite',
        title: 'Group invite',
        body: `You were invited to a poker group (${email}).`,
        data: { inviteId: inv.id, groupId },
      })

      await sendPushToUsers(svc, [invitedUserId], {
        title: 'Poker Ledger — Group invite',
        body: 'You have a new group invite.',
        url: '/groups',
      }).catch(() => {})
    }

    return new Response(JSON.stringify(inv), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message ?? e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
