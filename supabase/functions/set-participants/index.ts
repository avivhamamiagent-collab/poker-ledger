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
    const userIds = Array.isArray(body?.userIds) ? body.userIds.map((x: any) => String(x)) : []
    if (!gameId) return new Response(JSON.stringify({ error: 'gameId required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const svc = createServiceClient()

    const { data: g, error: gErr } = await svc.from('games').select('id,host_user_id').eq('id', gameId).single()
    if (gErr) throw gErr
    if (g.host_user_id !== u.user.id) return new Response(JSON.stringify({ error: 'Only the host can set participants' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const { error: delErr } = await svc.from('game_participants').delete().eq('game_id', gameId)
    if (delErr) throw delErr

    if (userIds.length) {
      const { error: insErr } = await svc.from('game_participants').insert(
        userIds.map((uid: string) => ({ game_id: gameId, user_id: uid, selected_by: u.user.id })),
      )
      if (insErr) throw insErr
    }

    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message ?? e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
