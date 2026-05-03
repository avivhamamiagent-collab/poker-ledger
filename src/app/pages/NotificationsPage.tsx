import { BellRing, CheckCircle2, Radio } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { useToast } from '../../components/ui/use-toast'
import { useNotifications } from '../hooks/useNotifications'
import { useWebPush } from '../push/useWebPush'
import { useStore } from '../store-context'

export function NotificationsPage() {
  const store = useStore()
  const { items, loading, error, refresh } = useNotifications()
  const toast = useToast()
  const push = useWebPush()

  async function markRead(id: string) {
    try {
      await store.markNotificationRead(id)
      await refresh()
    } catch (err: unknown) {
      toast.push({ title: 'נכשל', description: err instanceof Error ? err.message : String(err) })
    }
  }

  async function enablePush() {
    try {
      await push.enable()
      toast.push({ title: 'התראות הופעלו', description: 'תקבל התראות על הזמנות ומשחקים חדשים.' })
    } catch (err: unknown) {
      toast.push({ title: 'הפעלת ההתראות נכשלה', description: err instanceof Error ? err.message : String(err) })
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <section className="gold-bezel overflow-hidden rounded-2xl bg-surface-container-low/78 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)]">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-tertiary/12 text-tertiary">
            <BellRing className="h-7 w-7" />
          </div>
          <div>
            <div className="text-xs font-semibold text-tertiary">מרכז התראות</div>
            <h1 className="text-2xl font-black text-on-surface">התראות</h1>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">הזמנות, עדכוני משחק ותזכורות סגירה.</p>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-tertiary" />
            התראות Push
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!push.supported ? (
            <p className="text-sm leading-6 text-on-surface-variant">
              Push לא זמין בדפדפן/מכשיר הזה (או שחסר VAPID key). עדיין תראה התראות בתוך האפליקציה.
            </p>
          ) : push.permission === 'granted' ? (
            <p className="flex items-center gap-2 text-sm text-emerald-200">
              <CheckCircle2 className="h-4 w-4" />
              Push פעיל.
            </p>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm leading-6 text-on-surface-variant">הפעל Push כדי לקבל התראות על הזמנות ומשחקים חדשים.</p>
              <Button variant="secondary" onClick={enablePush}>
                הפעלה
              </Button>
            </div>
          )}
          <p className="mt-3 text-xs leading-5 text-on-surface-variant">
            תמיכת iOS/Safari תלויה בגרסת iOS וב־הוספה למסך הבית. כשזה לא זמין, האפליקציה תציג התראות פנימיות.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>אחרונות</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2 py-1">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-3/4" />
            </div>
          ) : error ? (
            <div className="text-sm text-red-200">{error}</div>
          ) : items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-tertiary/18 bg-black/14 p-5 text-center">
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-tertiary/12 text-tertiary">
                <BellRing className="h-6 w-6" />
              </div>
              <div className="font-semibold text-on-surface">אין התראות כרגע</div>
              <div className="mt-1 text-sm leading-6 text-on-surface-variant">כשתהיה הזמנה לקבוצה או עדכון משחק, זה יופיע כאן.</div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.map((n) => (
                <div key={n.id} className="rounded-xl border border-tertiary/14 bg-black/14 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium">{n.title}</div>
                      <div className="text-sm leading-6 text-on-surface-variant">{n.body}</div>
                      <div className="mt-1 text-xs text-on-surface-variant">{new Date(n.createdAt).toLocaleString('he-IL')}</div>
                    </div>
                    {n.readAt ? (
                      <div className="text-xs text-on-surface-variant">נקרא</div>
                    ) : (
                      <Button size="sm" variant="secondary" onClick={() => markRead(n.id)}>
                        סמן כנקרא
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
