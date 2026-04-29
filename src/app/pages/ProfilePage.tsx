import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Bell, Settings, Sparkles, UsersRound } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuth } from '../auth/auth-context'

export function ProfilePage() {
  const { enabled, user } = useAuth()

  return (
    <div className="flex flex-col gap-5">
      <section className="gold-bezel overflow-hidden rounded-2xl bg-surface-container-low/78 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)]">
        <div className="flex items-center gap-4">
          <div className="chip-face h-16 w-16 shrink-0 rounded-full" />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-tertiary">מרכז השליטה</div>
            <h1 className="text-2xl font-black text-on-surface">פרופיל וקיצורי דרך</h1>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">כל הפיצ׳רים החשובים במקום אחד.</p>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>חשבון</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {enabled ? (
            user ? (
              <div>
                <div className="font-semibold text-emerald-200">מחובר</div>
                <div className="mt-1 truncate text-on-surface-variant">User ID: {user.id}</div>
              </div>
            ) : (
              <div className="text-on-surface-variant">לא מחובר. <Link to="/login" className="text-tertiary underline">התחבר</Link></div>
            )
          ) : (
            <div className="text-on-surface-variant">מצב מקומי, ללא התחברות Supabase.</div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <FeatureLink to="/" icon="casino" title="שולחנות" body="פתיחה, כניסות, סגירות וסטלמנט" />
        <FeatureLink to="/groups" icon="groups" title="קבוצות" body="הזמנות, משחקים ותכנון ערב" />
        <FeatureLink to="/roster" iconNode={<UsersRound className="h-5 w-5" />} title="שחקנים" body="רוסטר קבוע עם טלפון אופציונלי" />
        <FeatureLink to="/notifications" iconNode={<Bell className="h-5 w-5" />} title="התראות" body="הזמנות, RSVP ותזכורות משחק" />
        <FeatureLink to="/onboarding" iconNode={<Sparkles className="h-5 w-5" />} title="התחלה מהירה" body="מסלול מודרך לפתיחת שולחן" />
        <FeatureLink to="/settings" iconNode={<Settings className="h-5 w-5" />} title="הגדרות" body="אחסון, שפה ומצב מערכת" />
      </div>
    </div>
  )
}

function FeatureLink({
  to,
  icon,
  iconNode,
  title,
  body,
}: {
  to: string
  icon?: string
  iconNode?: ReactNode
  title: string
  body: string
}) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-tertiary/14 bg-surface-container/72 p-4 shadow-[0_14px_40px_rgba(0,0,0,0.24)] transition-all hover:border-tertiary/30 hover:bg-surface-container-high/80 active:scale-[0.98]"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-tertiary/12 text-tertiary">
          {iconNode ?? <span className="material-symbols-outlined">{icon}</span>}
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-on-surface">{title}</div>
          <div className="mt-1 text-sm leading-6 text-on-surface-variant">{body}</div>
        </div>
      </div>
    </Link>
  )
}
