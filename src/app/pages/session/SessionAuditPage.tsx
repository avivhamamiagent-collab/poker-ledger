import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { useSession } from '../../hooks/useSession'

export function SessionAuditPage() {
  const { session, loading, error } = useSession()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>טוען…</CardTitle>
        </CardHeader>
      </Card>
    )
  }
  if (error || !session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>לא הצלחנו לטעון יומן שינויים</CardTitle>
          {error && <CardDescription>{error}</CardDescription>}
        </CardHeader>
      </Card>
    )
  }

  const events = [...session.audit].sort((a, b) => b.ts - a.ts)

  return (
    <Card>
      <CardHeader>
        <CardTitle>יומן שינויים</CardTitle>
        <CardDescription>האירועים האחרונים מופיעים קודם.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {events.length === 0 ? (
          <div className="text-sm text-on-surface-variant">אין עדיין אירועים ביומן.</div>
        ) : (
          events.map((e) => (
            <div key={e.id} className="rounded-xl border border-tertiary/14 bg-black/14 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="font-semibold text-on-surface">{e.type}</div>
                <div className="text-xs text-on-surface-variant">{new Date(e.ts).toLocaleString('he-IL')}</div>
              </div>
              <div className="mt-1 text-sm text-on-surface-variant">{e.message}</div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
