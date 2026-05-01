import * as React from 'react'
import { Link, useParams } from 'react-router-dom'
import { CalendarClock, Check, CircleHelp, X } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Skeleton } from '../../../components/ui/skeleton'
import { useToast } from '../../../components/ui/use-toast'
import type { Game, GameParticipant, GameRsvp } from '../../../domain/types'
import { useAuth } from '../../auth/auth-context'
import { useStore } from '../../store-context'

export function GamePage() {
  const { id } = useParams<{ id: string }>()
  const store = useStore()
  const { user } = useAuth()
  const toast = useToast()

  const [loading, setLoading] = React.useState(true)
  const [game, setGame] = React.useState<Game | null>(null)
  const [rsvps, setRsvps] = React.useState<GameRsvp[]>([])
  const [participants, setParticipants] = React.useState<GameParticipant[]>([])

  const refresh = React.useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const [g, r, p] = await Promise.all([store.getGame(id), store.listGameRsvps(id), store.listGameParticipants(id)])
      setGame(g ?? null)
      setRsvps(r)
      setParticipants(p)
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

  async function setRsvp(status: GameRsvp['status']) {
    if (!id) return
    try {
      await store.setMyRsvp(id, status)
      await refresh()
      toast.push({ title: 'התשובה נשמרה' })
    } catch (err: unknown) {
      toast.push({ title: 'שמירת התשובה נכשלה', description: err instanceof Error ? err.message : String(err) })
    }
  }

  const myRsvp = user ? rsvps.find((r) => r.userId === user.id)?.status : undefined
  const isHost = user && game && user.id === game.hostUserId

  async function toggleParticipant(userId: string) {
    if (!id || !isHost) return
    const next = new Set(participants.map((p) => p.userId))
    if (next.has(userId)) next.delete(userId)
    else next.add(userId)

    try {
      await store.setGameParticipants(id, Array.from(next))
      await refresh()
      toast.push({ title: 'המשתתפים עודכנו' })
    } catch (err: unknown) {
      toast.push({ title: 'נכשל', description: err instanceof Error ? err.message : String(err) })
    }
  }

  if (!id) return null

  return (
    <div className="flex flex-col gap-5">
      <section className="gold-bezel overflow-hidden rounded-2xl bg-surface-container-low/78 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)]">
        <div className="flex items-start justify-between gap-4">
        <div>
            <div className="text-xs font-semibold text-tertiary">משחק מתוכנן</div>
            <h1 className="text-2xl font-black text-on-surface">{game?.title || 'משחק'}</h1>
            {game?.startsAt ? <p className="mt-1 text-sm text-on-surface-variant">{new Date(game.startsAt).toLocaleString('he-IL')}</p> : null}
            {game?.location ? <p className="text-sm text-on-surface-variant">{game.location}</p> : null}
        </div>
        {game?.groupId ? (
            <Link to={`/group/${game.groupId}`} className="rounded-lg border border-tertiary/16 px-3 py-2 text-sm font-semibold text-tertiary">
              חזרה
          </Link>
        ) : null}
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-tertiary" />
            התשובה שלך
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 motion-safe:animate-slideUp">
            <Button variant={myRsvp === 'going' ? 'default' : 'secondary'} onClick={() => setRsvp('going')}>
              <Check className="h-4 w-4" />
              מגיע
            </Button>
            <Button variant={myRsvp === 'interested' ? 'default' : 'secondary'} onClick={() => setRsvp('interested')}>
              <CircleHelp className="h-4 w-4" />
              אולי
            </Button>
            <Button variant={myRsvp === 'no' ? 'default' : 'secondary'} onClick={() => setRsvp('no')}>
              <X className="h-4 w-4" />
              לא
            </Button>
          </div>
          <p className="mt-3 text-xs leading-5 text-on-surface-variant">התשובה משותפת עם הקבוצה כדי שהמארח יבחר משתתפים סופיים.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>תגובות RSVP</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : rsvps.length === 0 ? (
            <div className="text-sm text-on-surface-variant">אין תגובות עדיין.</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {rsvps.map((r) => (
                <div key={r.userId} className="rounded-xl border border-tertiary/14 bg-black/14 p-3 text-sm">
                  <div className="font-medium">{statusLabel(r.status)}</div>
                  <div className="text-xs text-on-surface-variant">עודכן {new Date(r.updatedAt).toLocaleString('he-IL')}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>משתתפים סופיים</CardTitle>
        </CardHeader>
        <CardContent>
          {!isHost ? (
            <div className="text-sm text-on-surface-variant">רק המארח יכול לבחור את המשתתפים הסופיים.</div>
          ) : (
            <div className="text-sm text-on-surface-variant">לוחצים על כרטיס תשובה כדי לכלול או להוציא.</div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-2">
            {rsvps.map((r) => {
              const selected = participants.some((p) => p.userId === r.userId)
              const clickable = Boolean(isHost)
              return (
                <button
                  key={r.userId}
                  type="button"
                  onClick={() => (clickable ? toggleParticipant(r.userId) : null)}
                  className={
                    'rounded-xl border p-3 text-right text-sm transition-colors ' +
                    (selected
                      ? 'border-tertiary/30 bg-tertiary/14 text-tertiary'
                      : 'border-tertiary/14 bg-black/14 text-on-surface hover:bg-surface-container-high/70')
                  }
                  disabled={!clickable}
                >
                  <div className="font-medium">{statusLabel(r.status)}</div>
                  <div className="text-xs opacity-80">{selected ? 'נבחר' : 'לא נבחר'}</div>
                </button>
              )
            })}
          </div>

          {game?.sessionId ? (
            <div className="mt-4">
              <Button asChild>
                <Link to={`/session/${game.sessionId}`}>פתח לדג׳ר</Link>
              </Button>
              <p className="mt-2 text-xs leading-5 text-on-surface-variant">
                הלדג׳ר משותף לקבוצה. גם בלי Push, התראות פנימיות יופיעו באפליקציה.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}

function statusLabel(status: GameRsvp['status']) {
  if (status === 'going') return 'מגיע'
  if (status === 'interested') return 'אולי'
  return 'לא מגיע'
}
