import { corsHeaders } from '../_shared/cors.ts'
import { createAuthedClient, createServiceClient } from '../_shared/sb.ts'
import { sendPushToUsers } from '../_shared/push.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authed = createAuthedClient(req)
    const { data: u, error: uErr } = await authed.auth.getUser()
    if (uErr) throw uErr
    if (!u.user) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const body = await req.json()
    const inviteId = String(body?.inviteId ?? '')
    const status = body?.status === 'accepted' ? 'accepted' : body?.status === 'declined' ? 'declined' : null
    if (!inviteId || !status) return new Response(JSON.stringify({ error: 'inviteId and valid status required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const svc = createServiceClient()

    const { data: inv, error: invErr } = await svc
      .from('group_invites')
      .select('*')
      .eq('id', inviteId)
      .single()
    if (invErr) throw invErr

    const email = String(inv.email ?? '').toLowerCase()
    const myEmail = String(u.user.email ?? '').toLowerCase()
    if (!myEmail || myEmail !== email) return new Response(JSON.stringify({ error: 'Invite email does not match your account' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const { error: updErr } = await svc
      .from('group_invites')
      .update({ status, responded_at: new Date().toISOString() })
      .eq('id', inviteId)
    if (updErr) throw updErr

    if (status === 'accepted') {
      const { error: memberErr } = await svc
        .from('group_members')
        .upsert({ group_id: inv.group_id, user_id: u.user.id, role: 'member' }, { onConflict: 'group_id,user_id' })
      if (memberErr) throw memberErr

      // notify owners
      const { data: owners, error: ownersErr } = await svc
        .from('group_members')
        .select('user_id')
        .eq('group_id', inv.group_id)
        .eq('role', 'owner')
      if (ownersErr) throw ownersErr

      const ownerIds = (owners ?? []).map((o: any) => o.user_id)
      if (ownerIds.length) {
        const { error: notifErr } = await svc.from('notifications').insert(
          ownerIds.map((oid: string) => ({
            user_id: oid,
            type: 'invite_accepted',
            title: 'Invite accepted',
            body: `${u.user.email} joined your group.`,
            data: { groupId: inv.group_id },
          })),
        )
        if (notifErr) throw notifErr
        await sendPushToUsers(svc, ownerIds, {
          title: 'Poker Ledger — Invite accepted',
          body: `${u.user.email} joined your group.`,
          url: `/group/${inv.group_id}`,
        }).catch(() => {})
      }
    }

    return new Response(JSON.stringify({ ok: true, groupId: inv.group_id, status }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message ?? e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
