import * as React from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { useToast } from '../../../components/ui/use-toast'
import type { Game, Group, GroupMember } from '../../../domain/types'
import { useStore } from '../../store-context'

export function GroupPage() {
  const { id } = useParams<{ id: string }>()
  const store = useStore()
  const { toast } = useToast()

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
    refresh().catch(() => {})
  }, [refresh])

  async function invite(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return
    setInviting(true)
    try {
      await store.inviteGroupMember(id, inviteEmail.trim())
      setInviteEmail('')
      toast({ title: 'Invite sent', description: 'They will see it after signing in with that email.' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Invite failed', description: String(err?.message ?? err) })
    } finally {
      setInviting(false)
    }
  }

  async function createGame(e: React.FormEvent) {
    e.preventDefault()
    if (!id) return

    const startsAtMs = newStartsAt ? new Date(newStartsAt).getTime() : NaN
    if (!Number.isFinite(startsAtMs)) {
      toast({ variant: 'destructive', title: 'Pick a date & time' })
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
      toast({ title: 'Game created', description: 'Invites & notifications sent to the group.' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to create game', description: String(err?.message ?? err) })
    } finally {
      setCreating(false)
    }
  }

  if (!id) return null

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">{group?.name ?? 'Group'}</h1>
          <p className="text-sm text-zinc-500">Plan games, RSVP, then run the ledger.</p>
        </div>
        <Link to="/groups" className="text-sm text-zinc-600 underline underline-offset-4">
          Back
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invite a member</CardTitle>
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
              {inviting ? 'Sending…' : 'Invite'}
            </Button>
          </form>
          <p className="mt-2 text-xs text-zinc-500">
            Tip: they must sign in with the same email to accept.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-zinc-500">Loading…</div>
          ) : members.length === 0 ? (
            <div className="text-sm text-zinc-500">No members (yet).</div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {members.map((m) => (
                <div key={m.userId} className="rounded-md border border-zinc-200 p-3 text-sm">
                  <div className="font-medium">{m.role === 'owner' ? 'Owner' : 'Member'}</div>
                  <div className="text-xs text-zinc-500">Joined {new Date(m.joinedAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create a game</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createGame} className="flex flex-col gap-2">
            <Input placeholder="Title (optional)" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <Input type="datetime-local" value={newStartsAt} onChange={(e) => setNewStartsAt(e.target.value)} required />
            <Input placeholder="Location (optional)" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create game'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming games</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-zinc-500">Loading…</div>
          ) : games.length === 0 ? (
            <div className="text-sm text-zinc-500">No games yet. Create one above.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {games.map((g) => (
                <Link
                  key={g.id}
                  to={`/game/${g.id}`}
                  className="rounded-md border border-zinc-200 bg-white p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium">{g.title || 'Game'}</div>
                      <div className="text-sm text-zinc-500">{new Date(g.startsAt).toLocaleString()}</div>
                      {g.location ? <div className="text-sm text-zinc-500">{g.location}</div> : null}
                    </div>
                    <div className="text-xs text-zinc-500">Tap</div>
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
