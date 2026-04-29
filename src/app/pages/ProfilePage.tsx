import { Link } from 'react-router-dom'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuth } from '../auth/auth-context'

export function ProfilePage() {
  const { enabled, user } = useAuth()

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-lg font-semibold">פרופיל</h1>
        <p className="text-sm text-zinc-500">הגדרות וקיצורי דרך.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>חשבון</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {enabled ? (
            user ? (
              <div>
                <div className="font-medium">מחובר</div>
                <div className="text-zinc-500">User ID: {user.id}</div>
              </div>
            ) : (
              <div className="text-zinc-500">לא מחובר. <Link to="/login" className="underline">התחבר</Link></div>
            )
          ) : (
            <div className="text-zinc-500">Local mode (ללא התחברות Supabase).</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>קיצורים</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="secondary"><Link to="/">סשנים</Link></Button>
          <Button asChild variant="secondary"><Link to="/roster">שחקנים</Link></Button>
          <Button asChild variant="secondary"><Link to="/groups">קבוצות</Link></Button>
          <Button asChild variant="secondary"><Link to="/notifications">התראות</Link></Button>
        </CardContent>
      </Card>
    </div>
  )
}
