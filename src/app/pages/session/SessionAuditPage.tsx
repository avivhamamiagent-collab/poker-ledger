import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { useSession } from '../../hooks/useSession'

export function SessionAuditPage() {
  const { session, loading, error } = useSession()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading…</CardTitle>
        </CardHeader>
      </Card>
    )
  }
  if (error || !session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Couldn’t load audit</CardTitle>
          {error && <CardDescription>{error}</CardDescription>}
        </CardHeader>
      </Card>
    )
  }

  const events = [...session.audit].sort((a, b) => b.ts - a.ts)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit log</CardTitle>
        <CardDescription>Newest first.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.length === 0 ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">No events yet.</div>
        ) : (
          events.map((e) => (
            <div key={e.id} className="rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold">{e.type}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">{new Date(e.ts).toLocaleString()}</div>
              </div>
              <div className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{e.message}</div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

