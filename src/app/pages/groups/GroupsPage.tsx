import * as React from 'react'
import { Link } from 'react-router-dom'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { useToast } from '../../../components/ui/use-toast'
import type { GroupInvite } from '../../../domain/types'
import { useGroups } from '../../hooks/useGroups'
import { useStore } from '../../store-context'

export function GroupsPage() {
  const store = useStore()
  const { groups, loading, error, refresh } = useGroups()
  const { toast } = useToast()

  const [invites, setInvites] = React.useState<GroupInvite[]>([])
  const [invLoading, setInvLoading] = React.useState(true)
  const [name, setName] = React.useState('')
  const [creating, setCreating] = React.useState(false)

  const loadInvites = React.useCallback(async () => {
    setInvLoading(true)
    try {
      setInvites(await store.listMyInvites())
    } finally {
      setInvLoading(false)
    }
  }, [store])

  React.useEffect(() => {
    loadInvites().catch(() => {})
  }, [loadInvites])

  async function createGroup(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    try {
      await store.createGroup(name.trim())
      setName('')
      await refresh()
      toast({ title: 'Group created' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to create group', description: String(err?.message ?? err) })
    } finally {
      setCreating(false)
    }
  }

  async function respond(inviteId: string, status: 'accepted' | 'declined') {
    try {
      await store.respondToInvite(inviteId, status)
      await Promise.all([refresh(), loadInvites()])
      toast({ title: status === 'accepted' ? 'Joined group' : 'Invite declined' })
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed', description: String(err?.message ?? err) })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Groups</h1>
          <p className="text-sm text-zinc-500">Organize games with friends. Invite by email.</p>
        </div>
        <Link to="/notifications" className="text-sm text-zinc-600 underline underline-offset-4">
          Notifications
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create a group</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={createGroup} className="flex gap-2">
            <Input placeholder="e.g. Thursday Night" value={name} onChange={(e) => setName(e.target.value)} required />
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invites</CardTitle>
        </CardHeader>
        <CardContent>
          {invLoading ? (
            <div className="text-sm text-zinc-500">Loading…</div>
          ) : invites.length === 0 ? (
            <div className="text-sm text-zinc-500">No pending invites.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {invites
                .filter((i) => i.status === 'pending')
                .map((i) => (
                  <div key={i.id} className="flex items-center justify-between gap-2 rounded-md border border-zinc-200 p-3">
                    <div className="text-sm">
                      <div className="font-medium">Group invite</div>
                      <div className="text-zinc-500">To: {i.email}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => respond(i.id, 'declined')}>Decline</Button>
                      <Button size="sm" onClick={() => respond(i.id, 'accepted')}>Accept</Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your groups</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-zinc-500">Loading…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : groups.length === 0 ? (
            <div className="text-sm text-zinc-500">No groups yet. Create one above.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {groups.map((g) => (
                <Link
                  key={g.id}
                  to={`/group/${g.id}`}
                  className="rounded-md border border-zinc-200 bg-white p-3 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900"
                >
                  <div className="font-medium">{g.name}</div>
                  <div className="text-xs text-zinc-500">Updated {new Date(g.updatedAt).toLocaleString()}</div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
