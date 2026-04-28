import { corsHeaders } from '../_shared/cors.ts'
import { createAuthedClient, createServiceClient } from '../_shared/sb.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authed = createAuthedClient(req)
    const { data: u, error: uErr } = await authed.auth.getUser()
    if (uErr) throw uErr
    if (!u.user) return new Response(JSON.stringify({ error: 'Not authenticated' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const body = await req.json()
    const gameId = String(body?.gameId ?? '')
    const status = body?.status
    if (!gameId || !['going', 'interested', 'no'].includes(status)) {
      return new Response(JSON.stringify({ error: 'gameId and valid status required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const svc = createServiceClient()

    // ensure user is a member of the game group
    const { data: g, error: gErr } = await svc.from('games').select('id,group_id').eq('id', gameId).single()
    if (gErr) throw gErr

    const { data: mem, error: memErr } = await svc
      .from('group_members')
      .select('group_id')
      .eq('group_id', g.group_id)
      .eq('user_id', u.user.id)
      .maybeSingle()
    if (memErr) throw memErr
    if (!mem) return new Response(JSON.stringify({ error: 'Not a group member' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const { error: upErr } = await svc
      .from('game_rsvps')
      .upsert({ game_id: gameId, user_id: u.user.id, status, updated_at: new Date().toISOString() }, { onConflict: 'game_id,user_id' })
    if (upErr) throw upErr

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message ?? e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
