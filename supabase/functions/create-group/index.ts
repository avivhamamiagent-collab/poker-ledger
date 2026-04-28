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
    const name = String(body?.name ?? '').trim()
    if (!name) return new Response(JSON.stringify({ error: 'name is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

    const svc = createServiceClient()

    const { data: g, error: gErr } = await svc
      .from('groups')
      .insert({ name, created_by: u.user.id })
      .select('*')
      .single()
    if (gErr) throw gErr

    const { error: mErr } = await svc.from('group_members').insert({ group_id: g.id, user_id: u.user.id, role: 'owner' })
    if (mErr) throw mErr

    return new Response(JSON.stringify(g), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: String((e as any)?.message ?? e) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
