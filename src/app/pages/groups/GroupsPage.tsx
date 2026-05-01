import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarClock, ChevronLeft, Mail, Plus, UsersRound } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { SkeletonList } from '../../../components/ui/skeleton'
import { useToast } from '../../../components/ui/use-toast'
import type { GroupInvite } from '../../../domain/types'
import { useGroups } from '../../hooks/useGroups'
import { useStore } from '../../store-context'

export function GroupsPage() {
  const store = useStore()
  const { groups, loading, error, refresh } = useGroups()
  const toast = useToast()
  const nav = useNavigate()

  const [invites, setInvites] = React.useState<GroupInvite[]>([])
  const [invLoading, setInvLoading] = React.useState(true)
  const [q, setQ] = React.useState('')

  const loadInvites = React.useCallback(async () => {
    setInvLoading(true)
    try {
      setInvites(await store.listMyInvites())
    } finally {
      setInvLoading(false)
    }
  }, [store])

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      loadInvites().catch(() => {})
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadInvites])

  async function respond(inviteId: string, status: 'accepted' | 'declined') {
    try {
      await store.respondToInvite(inviteId, status)
      await Promise.all([refresh(), loadInvites()])
      toast.push({ title: status === 'accepted' ? 'הצטרפת לקבוצה' : 'ההזמנה נדחתה' })
      if (status === 'accepted') {
        await refresh()
        await loadInvites()
      }
    } catch (err: unknown) {
      toast.push({ title: 'נכשל', description: err instanceof Error ? err.message : String(err) })
    }
  }

  const filtered = groups.filter((g) => g.name.toLowerCase().includes(q.trim().toLowerCase()))
  const pendingInvites = invites.filter((i) => i.status === 'pending')

  return (
    <div className="space-y-5 pb-10">
      <section className="gold-bezel overflow-hidden rounded-2xl bg-surface-container-low/72 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.38)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-tertiary/20 bg-tertiary/10 px-3 py-1 text-xs font-semibold text-tertiary">
              <UsersRound className="h-3.5 w-3.5" />
              תיאום משחקים
            </div>
            <h1 className="text-2xl font-black tracking-tight text-on-surface">הקבוצות שלי</h1>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">ניהול חברים, הזמנות ומשחקים מתוכננים במסך אחד.</p>
          </div>
          <Button onClick={() => nav('/groups/new')}>
            <Plus className="h-4 w-4" />
            קבוצה חדשה
          </Button>
        </div>
      </section>

      <Card>
        <CardContent className="p-4">
          <input
            className="h-11 w-full rounded-xl border border-tertiary/18 bg-surface-container-high/80 px-4 text-sm text-on-surface placeholder:text-on-surface-variant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/40"
            placeholder="חיפוש קבוצות..."
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </CardContent>
      </Card>

      {error ? <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</div> : null}

      {!invLoading && pendingInvites.length ? (
        <div className="grid gap-3">
          {pendingInvites.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-tertiary/12 text-tertiary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-on-surface">הזמנה לקבוצה</div>
                    <div className="text-xs text-on-surface-variant">{inv.email}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" type="button" onClick={() => respond(inv.id, 'declined')}>
                    דחייה
                  </Button>
                  <Button type="button" onClick={() => respond(inv.id, 'accepted')}>
                    אישור
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {loading ? (
        <SkeletonList count={3} />
      ) : filtered.length === 0 ? (
        <Card className="text-center">
          <CardHeader className="items-center">
            <div className="chip-face mb-2 h-16 w-16 rounded-full" />
            <CardTitle>אין עדיין קבוצות</CardTitle>
            <CardDescription>קבוצה עוזרת לתאם משחק ולפתוח שולחן משותף בלחיצה אחת.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => nav('/groups/new')}>
              <Plus className="h-4 w-4" />
              יצירת קבוצה ראשונה
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((g) => (
            <Link key={g.id} to={`/group/${g.id}`}>
              <Card className="hover:border-tertiary/30">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-on-surface">{g.name}</div>
                    <div className="mt-1 text-xs text-on-surface-variant">
                      עודכן {new Date(g.updatedAt).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <CalendarClock className="h-4 w-4" />
                    <ChevronLeft className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
