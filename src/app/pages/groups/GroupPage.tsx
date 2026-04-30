import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarClock, CalendarPlus, MailPlus, Users } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { useToast } from '../../../components/ui/use-toast'
import type { Game, Group, GroupMember } from '../../../domain/types'
import { useStore } from '../../store-context'

export function GroupPage() {
  const { id } = useParams<{ id: string }>()
  const store = useStore()
  const toast = useToast()

  const [group, setGroup] = React.useState<Group | null>(null)
  const [members, setMembers] = React.useState<GroupMember[]>([])
  const [games, setGames] = React.useState<Game[]>([])
  const [loading, setLoading] = React.useState(true)
  const [inviteEmail, setInviteEmail] = React.useState('')
  const [inviting, setInviting] = React.useState(false)

  const [newTitle, setNewTitle] = React.useState('')
  const [newStartsAt, setNewStartsAt] = React.useState('') // datetime-local
  const [newLocation, setNewLocation] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const [creatingTonight, setCreatingTonight] = React.useState(false)

  const refresh = React.useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [g, m, gs] = await Promise.all([store.getGroup(id), store.listGroupMembers(id), store.listGames(id)])
      setGroup(g ?? null)
      setMembers(m)
      setGames(gs)
    } finally {
      setLoading(false)
    }
  }, [id, store])

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      refresh().catch(() => {})
    }, 0)
    return () => window.clearTimeout(timer)
  }, [refresh])

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setInviting(true)
    try {
      await store.inviteGroupMember(id, inviteEmail.trim())
      setInviteEmail('')
      toast.push({ title: 'Invite sent', description: 'They will see it after signing in with that email.' })
    } catch (err: unknown) {
      toast.push({ title: 'ההזמנה נכשלה', description: err instanceof Error ? err.message : String(err) })
    } finally {
      setInviting(false)
    }
  }

  async function createGame(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return

    const startsAtMs = newStartsAt ? new Date(newStartsAt).getTime() : NaN
    if (!Number.isFinite(startsAtMs)) {
      toast.push({ title: 'בחרו תאריך ושעה' })
      return
    }

    setCreating(true)
    try {
      await store.createGame({
        groupId: id,
        title: newTitle.trim(),
        startsAt: startsAtMs,
        location: newLocation.trim() || undefined,
      })
      setNewTitle('')
      setNewStartsAt('')
      setNewLocation('')
      await refresh()
      toast.push({ title: 'המשחק נוצר', description: 'הזמנות והתראות נשלחו לקבוצה.' })
    } catch (err: unknown) {
      toast.push({ title: 'יצירת המשחק נכשלה', description: err instanceof Error ? err.message : String(err) })
    } finally {
      setCreating(false)
    }
  }

  async function inviteTonight() {
    if (!id) return
    const start = new Date()
    start.setHours(21, 0, 0, 0)
    setCreatingTonight(true)
    try {
      await store.createGame({
        groupId: id,
        title: `${group?.name || 'פוקר'} - הערב`,
        startsAt: start.getTime(),
      })
      await refresh()
      toast.push({ title: 'זימון להערב נשלח', description: 'נוצר משחק חדש להיום, אפשר לעקוב אחרי ה-RSVP.' })
    } catch (err: unknown) {
      toast.push({ title: 'שליחת זימון נכשלה', description: err instanceof Error ? err.message : String(err) })
    } finally {
      setCreatingTonight(false)
    }
  }

  if (!id) return null

  return (
    <div className="flex flex-col gap-5">
      <section className="gold-bezel overflow-hidden rounded-2xl bg-surface-container-low/78 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)]">
        <div className="flex items-start justify-between gap-4">
        <div>
            <div className="text-xs font-semibold text-tertiary">קבוצת משחק</div>
            <h1 className="text-2xl font-black text-on-surface">{group?.name ?? 'קבוצה'}</h1>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">מתכננים משחק, אוספים RSVP ואז פותחים לדג׳ר משותף.</p>
        </div>
          <Link to="/groups" className="rounded-lg border border-tertiary/16 px-3 py-2 text-sm font-semibold text-tertiary">
            חזרה
        </Link>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <GroupStat label="חברים" value={String(members.length)} />
          <GroupStat label="משחקים" value={String(games.length)} />
          <GroupStat label="קרוב" value={games[0] ? new Date(games[0].startsAt).toLocaleDateString('he-IL') : '-'} />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MailPlus className="h-5 w-5 text-tertiary" />
            הזמנת חבר
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={invite} className="flex gap-2">
            <Input
              type="email"
              inputMode="email"
              placeholder="friend@email.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={inviting}>
              {inviting ? 'שולח…' : 'הזמנה'}
            </Button>
          </form>
          <p className="mt-2 text-xs leading-5 text-on-surface-variant">החבר צריך להתחבר עם אותו אימייל כדי לאשר את ההזמנה.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-300" />
            חברים
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-on-surface-variant">טוען…</div>
          ) : members.length === 0 ? (
            <div className="text-sm text-on-surface-variant">אין חברים עדיין.</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {members.map((m) => (
                <div key={m.userId} className="rounded-xl border border-tertiary/14 bg-black/14 p-3 text-sm">
                  <div className="font-medium">{m.role === 'owner' ? 'מנהל' : 'חבר'}</div>
                  <div className="text-xs text-on-surface-variant">הצטרף {new Date(m.joinedAt).toLocaleDateString('he-IL')}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-tertiary" />
            יצירת משחק
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createGame} className="flex flex-col gap-2">
            <Input placeholder="שם המשחק (אופציונלי)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Input type="datetime-local" value={newStartsAt} onChange={(e) => setNewStartsAt(e.target.value)} required />
            <Input placeholder="מיקום (אופציונלי)" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
            <Button type="submit" disabled={creating}>
              {creating ? 'יוצר…' : 'צור משחק'}
            </Button>
          </form>
          <div className="mt-3">
            <Button variant="secondary" onClick={inviteTonight} disabled={creatingTonight}>
              <CalendarClock className="h-4 w-4" />
              {creatingTonight ? 'שולח זימון…' : 'זימון להערב'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>משחקים קרובים</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-on-surface-variant">טוען…</div>
          ) : games.length === 0 ? (
            <div className="text-sm text-on-surface-variant">אין משחקים עדיין. אפשר ליצור אחד למעלה.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {games.map((g) => (
                <Link
                  key={g.id}
                  to={`/game/${g.id}`}
                  className="rounded-xl border border-tertiary/14 bg-black/14 p-3 transition-colors hover:border-tertiary/30 hover:bg-surface-container-high/70"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{g.title || 'משחק'}</div>
                      <div className="text-sm text-on-surface-variant">{new Date(g.startsAt).toLocaleString('he-IL')}</div>
                      {g.location ? <div className="text-sm text-on-surface-variant">{g.location}</div> : null}
                    </div>
                    <div className="text-xs text-tertiary">פתיחה</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function GroupStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/16 p-3">
      <div className="text-[11px] font-semibold text-on-surface-variant">{label}</div>
      <div className="mt-1 truncate text-sm font-black tabular-nums text-on-surface">{value}</div>
    </div>
  )
}
