import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useToast } from '../../components/ui/use-toast'
import { useNotifications } from '../hooks/useNotifications'
import { useWebPush } from '../push/useWebPush'
import { useStore } from '../store-context'

export function NotificationsPage() {
  const store = useStore()
  const { items, loading, error, refresh } = useNotifications()
  const { toast } = useToast()
  const push = useWebPush()

  async function markRead(id: string) {
    try {
      await store.markNotificationRead(id)
      await refresh()
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed', description: String(err?.message ?? err) })
    }
  }

  async function enablePush() {
    try {
      await push.enable()
      toast({ title: 'Push enabled', description: 'You’ll get notifications for invites and new games.' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Push setup failed', description: String(err?.message ?? err) })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">Notifications</h1>
        <p className="text-sm text-zinc-500">Invites, game updates, and reminders.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Push notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {!push.supported ? (
            <p className="text-sm text-zinc-500">
              Push isn’t available on this browser/device (or VAPID key isn’t configured). You’ll still see in-app notifications here.
            </p>
          ) : push.permission === 'granted' ? (
            <p className="text-sm text-zinc-500">Push is enabled.</p>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-zinc-500">Enable push to get game/invite alerts.</p>
              <Button variant="secondary" onClick={enablePush}>
                Enable
              </Button>
            </div>
          )}
          <p className="mt-2 text-xs text-zinc-500">
            iOS/Safari support depends on iOS version and “Add to Home Screen”. When unavailable, the app falls back to in-app notifications.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-zinc-500">Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : items.length === 0 ? (
            <div className="text-sm text-zinc-500">Nothing yet.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((n) => (
                <div key={n.id} className="rounded-md border border-zinc-200 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-sm text-zinc-600">{n.body}</div>
                      <div className="mt-1 text-xs text-zinc-500">{new Date(n.createdAt).toLocaleString()}</div>
                    </div>
                    {n.readAt ? (
                      <div className="text-xs text-zinc-400">Read</div>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => markRead(n.id)}>
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
