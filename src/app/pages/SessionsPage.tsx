import { useNavigate } from 'react-router-dom'
import { CalendarPlus, Trash2 } from 'lucide-react'

import { createSession } from '../../domain/session'
import type { Session } from '../../domain/types'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useStore } from '../store-context'
import { useSessions } from '../hooks/useSessions'
import { useToast } from '../../components/ui/use-toast'
import { getEnv } from '../../config/env'
import { useInstallPrompt } from '../pwa/useInstallPrompt'

export function SessionsPage() {
  const store = useStore()
  const { sessions, setSessions, loading, error } = useSessions()
  const nav = useNavigate()
  const toast = useToast()
  const env = getEnv()
  const install = useInstallPrompt()

  async function persist(next: Session) {
    await store.putSession(next)
    setSessions((prev) => {
      const rest = prev.filter((s) => s.id !== next.id)
      return [next, ...rest].sort((a, b) => b.updatedAt - a.updatedAt)
    })
  }

  async function onCreate() {
    const title = window.prompt('שם לשולחן (אופציונלי):') || undefined
    const s = createSession(title)
    await persist(s)
    nav(`/session/${s.id}`)
  }

  async function onDelete(s: Session) {
    if (!window.confirm('Delete this session? This cannot be undone.')) return
    await store.deleteSession(s.id)
    setSessions((prev) => prev.filter((x) => x.id !== s.id))
    toast.push({ title: 'Session deleted', description: s.title || s.dateISO })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">שולחנות</h1>
          <p className="text-sm text-zinc-300">ניהול מהיר של כניסות, ריבאים וסגירת ערב.</p>
        </div>
        <Button onClick={onCreate} className="shrink-0">
          <CalendarPlus className="h-4 w-4" />
          שולחן חדש
        </Button>
      </div>

      {install.canInstall ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="font-medium">להתקין על המסך הראשי</div>
              <div className="text-xs text-zinc-500">גישה מהירה יותר, כמו אפליקציה אמיתית.</div>
            </div>
            <Button variant="secondary" onClick={() => install.prompt().catch(() => {})}>
              התקנה
            </Button>
          </div>
        </div>
      ) : null}

      {error && <div className="rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</div>}

      {loading ? (
        <Card>
          <CardHeader>
            <CardTitle>טוען…</CardTitle>
            <CardDescription>מושך נתונים מהאחסון.</CardDescription>
          </CardHeader>
        </Card>
      ) : sessions.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>אין עדיין שולחנות</CardTitle>
            <CardDescription>אפשר להתחיל ב״2 דקות״ מודרך, או לפתוח שולחן לבד.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button onClick={() => nav('/onboarding')}>התחלה מהירה (2 דקות)</Button>
            <Button variant="secondary" onClick={onCreate}>פתיחת שולחן ראשון</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {sessions.map((s) => (
            <Card key={s.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-3">
                  <span className="truncate">{s.title || 'שולחן ללא שם'}</span>
                  <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">{s.dateISO}</span>
                </CardTitle>
                <CardDescription>{s.participantIds.length} משתתפים</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-2">
                <Button variant="secondary" onClick={() => nav(`/session/${s.id}`)}>
                  פתיחה
                </Button>
                <Button variant="ghost" onClick={() => onDelete(s)} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                  מחיקה
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-500 dark:text-zinc-400">
        Storage:{' '}
        <span className="font-medium">{env.storage === 'supabase' ? 'Supabase (רב-מכשירי)' : 'IndexedDB מקומי'}</span>
        {env.storage === 'supabase' ? null : '. נשמר מקומית כברירת מחדל.'}
      </p>
    </div>
  )
}

