/* Minimal offline cache + Web Push for Poker Ledger */
const CACHE = 'poker-ledger-v2'
const ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/icon.svg']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => (k === CACHE ? null : caches.delete(k)))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)
  if (url.origin !== self.location.origin) return

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached
      return fetch(req)
        .then((resp) => {
          // Cache GET only
          if (req.method === 'GET' && resp.ok) {
            const copy = resp.clone()
            caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {})
          }
          return resp
        })
        .catch(() => cached || caches.match('/'))
    }),
  )
})

self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      let payload = {}
      try {
        payload = event.data ? event.data.json() : {}
      } catch {
        try {
          const t = event.data ? await event.data.text() : ''
          payload = { title: 'Poker Ledger', body: t }
        } catch {
          payload = { title: 'Poker Ledger', body: '' }
        }
      }

      const title = payload.title || 'Poker Ledger'
      const options = {
        body: payload.body || '',
        data: { url: payload.url || '/' },
        icon: '/icon.svg',
        badge: '/icon.svg',
      }

      await self.registration.showNotification(title, options)
    })(),
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.url || '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientsArr) => {
      for (const client of clientsArr) {
        if ('focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    }),
  )
})

