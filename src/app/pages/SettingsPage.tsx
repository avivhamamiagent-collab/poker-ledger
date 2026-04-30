import { useNavigate } from 'react-router-dom'
import { Bell, Database, LogOut, RefreshCw, ShieldCheck, Trash2 } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { useToast } from '../../components/ui/use-toast'
import { getEnv } from '../../config/env'
import { signOut } from '../auth/auth-context'
import { supabase } from '../../data/supabase/client'

export function SettingsPage() {
  const nav = useNavigate()
  const toast = useToast()
  const env = getEnv()

  async function checkConnection() {
    try {
      const sb = supabase()
      const { error } = await sb.auth.getSession()
      if (error) throw error
      toast.push({ title: 'החיבור תקין', description: 'Supabase זמין ומחובר.' })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      toast.push({ title: 'שגיאת חיבור', description: msg })
    }
  }

  async function clearBrowserCache() {
    const ok = window.confirm('לנקות cache מקומי של הדפדפן ולרענן את האפליקציה?')
    if (!ok) return
    try {
      if ('caches' in window) {
        const keys = await caches.keys()
        await Promise.all(keys.map((key) => caches.delete(key)))
      }
      toast.push({ title: 'ה-cache נוקה', description: 'מרענן עכשיו את האפליקציה.' })
      window.setTimeout(() => window.location.reload(), 350)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      toast.push({ title: 'ניקוי cache נכשל', description: msg })
    }
  }

  async function onSignOut() {
    try {
      await signOut()
      nav('/login', { replace: true })
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      toast.push({ title: 'יציאה נכשלה', description: msg })
    }
  }

  return (
    <div className="space-y-5">
      <section className="gold-bezel overflow-hidden rounded-2xl bg-surface-container-low/78 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)]">
        <div className="text-xs font-semibold text-tertiary">קונפיגורציה ותפעול</div>
        <h1 className="mt-1 text-2xl font-black text-on-surface">הגדרות מערכת</h1>
        <p className="mt-1 text-sm leading-6 text-on-surface-variant">בדיקות חיבור, ניקוי cache, התראות ויציאה מחשבון.</p>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-tertiary" />
            מצב אחסון
          </CardTitle>
          <CardDescription>האפליקציה עובדת בענן בלבד דרך Supabase.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="rounded-xl border border-tertiary/16 bg-black/18 p-3 text-sm">
            <div>Storage: <span className="font-semibold">supabase</span></div>
            <div className="mt-1 text-on-surface-variant">ENV: {env.storage || 'supabase'}</div>
          </div>
          <Button variant="secondary" onClick={checkConnection}>
            <ShieldCheck className="h-4 w-4" />
            בדיקת חיבור Supabase
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>התראות</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => nav('/notifications')}>
              <Bell className="h-4 w-4" />
              מעבר להתראות
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>רענון לקוח</CardTitle>
          </CardHeader>
          <CardContent>
            <Button variant="secondary" onClick={clearBrowserCache}>
              <RefreshCw className="h-4 w-4" />
              ניקוי cache ורענון
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-100">אזור חשבון</CardTitle>
          <CardDescription>ניתוק מהחשבון הנוכחי.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={onSignOut}>
            <LogOut className="h-4 w-4" />
            יציאה מהחשבון
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-red-100">אזהרה</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-on-surface-variant">
          מחיקת נתוני מערכת נשלטת דרך מסד הנתונים והרשאות Supabase בלבד.
          <div className="mt-3">
            <Button variant="secondary" onClick={() => toast.push({ title: 'נחסם במכוון', description: 'מחיקת נתוני ענן מתבצעת רק בכלי ניהול מאובטחים.' })}>
              <Trash2 className="h-4 w-4" />
              מחיקה מלאה (חסום)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
