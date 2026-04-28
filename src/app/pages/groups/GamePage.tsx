import * as React from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { useToast } from '../../../components/ui/use-toast'
import type { GameParticipant, GameRsvp } from '../../../domain/types'
import { useAuth } from '../../auth/auth-context'
import { useStore } from '../../store-context'

export function GamePage() {
  const { id } = useParams<{ id: string }>()
  const store = useStore()
  const { user } = useAuth()
  const toast = useToast()

  const [loading, setLoading] = React.useState(true)
  const [game, setGame] = React.useState<any | null>(null)
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
    refresh().catch(() => {})
  }, [refresh])

  async function setRsvp(status: GameRsvp['status']) {
    if (!id) return
    try {
      await store.setMyRsvp(id, status)
      await refresh()
      toast.push({ title: 'RSVP saved' })
    } catch (err: any) {
      toast.push({ title: 'Failed to RSVP', description: String(err?.message ?? err) })
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
      toast.push({ title: 'Participants updated' })
    } catch (err: any) {
      toast.push({ title: 'Failed', description: String(err?.message ?? err) })
    }
  }

  if (!id) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{game?.title || 'Game'}</h1>
          {game?.startsAt ? <p className="text-sm text-zinc-500">{new Date(game.startsAt).toLocaleString()}</p> : null}
          {game?.location ? <p className="text-sm text-zinc-500">{game.location}</p> : null}
        </div>
        {game?.groupId ? (
          <Link to={`/group/${game.groupId}`} className="text-sm text-zinc-600 underline underline-offset-4">
            Back
          </Link>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your RSVP</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button variant={myRsvp === 'going' ? 'default' : 'secondary'} onClick={() => setRsvp('going')}>
              Going
            </Button>
            <Button variant={myRsvp === 'interested' ? 'default' : 'secondary'} onClick={() => setRsvp('interested')}>
              Interested
            </Button>
            <Button variant={myRsvp === 'no' ? 'default' : 'secondary'} onClick={() => setRsvp('no')}>
              No
            </Button>
          </div>
          <p className="mt-2 text-xs text-zinc-500">This is shared with the group.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>RSVPs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-zinc-500">Loading…</div>
          ) : rsvps.length === 0 ? (
            <div className="text-sm text-zinc-500">No RSVPs yet.</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {rsvps.map((r) => (
                <div key={r.userId} className="rounded-md border border-zinc-200 p-3 text-sm">
                  <div className="font-medium">{r.status.toUpperCase()}</div>
                  <div className="text-xs text-zinc-500">Updated {new Date(r.updatedAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participants (host picks)</CardTitle>
        </CardHeader>
        <CardContent>
          {!isHost ? (
            <div className="text-sm text-zinc-500">Only the host can select final participants.</div>
          ) : (
            <div className="text-sm text-zinc-500">Tap an RSVP card to include/exclude.</div>
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
                    'rounded-md border p-3 text-left text-sm transition-colors ' +
                    (selected
                      ? 'border-zinc-900 bg-zinc-900 text-zinc-50'
                      : 'border-zinc-200 bg-white hover:bg-zinc-50')
                  }
                  disabled={!clickable}
                >
                  <div className="font-medium">{r.status.toUpperCase()}</div>
                  <div className="text-xs opacity-80">{selected ? 'Selected' : 'Not selected'}</div>
                </button>
              )
            })}
          </div>

          {game?.sessionId ? (
            <div className="mt-4">
              <Button asChild>
                <Link to={`/session/${game.sessionId}`}>Open ledger</Link>
              </Button>
              <p className="mt-2 text-xs text-zinc-500">
                The ledger is shared to the group (members can view/edit). If push is not supported on your browser, you’ll still get in-app notifications.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
