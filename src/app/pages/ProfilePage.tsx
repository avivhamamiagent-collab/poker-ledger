import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Bell, ChevronLeft, Database, History, Settings, ShieldCheck, UsersRound } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useAuth } from '../auth/auth-context'
import { useSessions } from '../hooks/useSessions'
import { useRoster } from '../hooks/useRoster'
import { useGroups } from '../hooks/useGroups'
import { getEnv } from '../../config/env'
import { Button } from '../../components/ui/button'

export function ProfilePage() {
  const { enabled, user } = useAuth()
  const { sessions, loading } = useSessions()
  const { roster } = useRoster()
  const { groups } = useGroups()
  const env = getEnv()
  const latestSession = sessions[0]
  const storageLabel = env.storage === 'supabase' ? 'ענן Supabase' : 'מקומי בדפדפן הזה'
  const nextAction = latestSession ? `/session/${latestSession.id}/entries` : '/onboarding'
  const nextActionLabel = latestSession ? 'חזרה לשולחן האחרון' : 'התחלה מהירה (2 דקות)'

  return (
    <div className="flex flex-col gap-5">
      <section className="gold-bezel overflow-hidden rounded-2xl bg-surface-container-low/78 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-tertiary">ניהול חשבון ונתונים</div>
            <h1 className="text-2xl font-black text-on-surface">הפרופיל שלך</h1>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">מכאן אפשר לראות מצב מערכת ולהמשיך ישר לפעולה הבאה.</p>
          </div>
          <Button asChild className="shrink-0">
            <Link to={nextAction}>
              {nextActionLabel}
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>מצב עבודה</CardTitle>
          <CardDescription>איך המידע נשמר ומצב החיבור שלך כרגע.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-on-surface">
            <Database className="h-4 w-4 text-tertiary" />
            <span className="font-semibold">{storageLabel}</span>
          </div>
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
            <div className="text-on-surface-variant">מצב מקומי פעיל, אין צורך בהתחברות כדי להמשיך לעבוד.</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-2">
        <StatTile label="שולחנות" value={String(sessions.length)} />
        <StatTile label="שחקנים" value={String(roster.length)} />
        <StatTile label="קבוצות" value={String(groups.length)} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <FeatureLink to="/sessions" iconNode={<History className="h-5 w-5" />} title="היסטוריית שולחנות" body="פתיחה, סגירה ומעקב אחרי כל הערבים." />
        <FeatureLink to="/groups" icon="groups" title="קבוצות" body="ניהול הזמנות, משחקים ו-RSVP במקום אחד." />
        <FeatureLink to="/roster" iconNode={<UsersRound className="h-5 w-5" />} title="שחקנים" body="רוסטר קבוע עם שמות ומספרי טלפון." />
        <FeatureLink to="/notifications" iconNode={<Bell className="h-5 w-5" />} title="התראות" body="עדכוני הזמנות ומשחקים אחרונים." />
        <FeatureLink to="/settings" iconNode={<Settings className="h-5 w-5" />} title="הגדרות" body="אחסון, מצב חיבור והעדפות מערכת." />
        <FeatureLink to="/login" iconNode={<ShieldCheck className="h-5 w-5" />} title="חשבון" body={enabled ? 'כניסה/יציאה וניהול חשבון משתמש.' : 'במצב מקומי אין צורך בחשבון.'} />
      </div>

      {!loading && sessions.length === 0 ? (
        <Card>
          <CardContent className="p-4 text-sm text-on-surface-variant">
            אין לך עדיין שולחנות פעילים. התחלה מהירה תפתח שולחן ראשון ותיקח אותך שלב-שלב.
          </CardContent>
        </Card>
      ) : null}
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

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/8 bg-black/16 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="text-[11px] font-semibold text-on-surface-variant">{label}</div>
      <div className="mt-1 truncate text-sm font-black tabular-nums text-on-surface sm:text-base">{value}</div>
    </div>
  )
}
