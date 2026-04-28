import webpush from 'npm:web-push@3.6.7'

export function configureVapid() {
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@example.com'

  if (!vapidPublicKey || !vapidPrivateKey) return { ok: false as const, error: 'Missing VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY' }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey)
  return { ok: true as const }
}

export async function sendPushToUsers(
  svc: any,
  userIds: string[],
  payload: { title: string; body: string; url?: string },
) {
  const cfg = configureVapid()
  if (!cfg.ok) return { ok: false as const, sent: 0, error: cfg.error }

  const { data: subs, error } = await svc
    .from('push_subscriptions')
    .select('id,user_id,endpoint,p256dh,auth')
    .in('user_id', userIds)

  if (error) throw error

  const body = JSON.stringify({ title: payload.title, body: payload.body, url: payload.url || '/' })

  let sent = 0
  for (const s of subs ?? []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, body)
      sent += 1
    } catch (err: any) {
      const code = err?.statusCode
      if (code === 404 || code === 410) {
        await svc.from('push_subscriptions').delete().eq('id', s.id)
      }
    }
  }

  return { ok: true as const, sent }
}
