import * as React from 'react'

import { getEnv } from '../../config/env'
import { useStore } from '../store-context'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const output = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; ++i) output[i] = raw.charCodeAt(i)
  return output
}

export function useWebPush() {
  const store = useStore()
  const env = getEnv()

  const supported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window &&
    Boolean(env.webPushPublicKey)

  const [permission, setPermission] = React.useState<NotificationPermission>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'default'
    return Notification.permission
  })

  async function enable() {
    if (!supported) throw new Error('Push not supported or VAPID public key missing')

    const perm = await Notification.requestPermission()
    setPermission(perm)
    if (perm !== 'granted') throw new Error('Permission not granted')

    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(env.webPushPublicKey!),
    })

    const json = sub.toJSON() as any
    const endpoint = json.endpoint
    const p256dh = json.keys?.p256dh
    const auth = json.keys?.auth
    if (!endpoint || !p256dh || !auth) throw new Error('Invalid subscription')

    await store.ensurePushSubscription({ endpoint, p256dh, auth, userAgent: navigator.userAgent })
  }

  return { supported, permission, enable }
}
