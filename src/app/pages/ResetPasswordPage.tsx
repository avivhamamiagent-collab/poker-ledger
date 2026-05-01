import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { useToast } from '../../components/ui/use-toast'
import { updatePassword } from '../auth/auth-context'

export function ResetPasswordPage() {
  const toast = useToast()
  const nav = useNavigate()

  const [password, setPassword] = React.useState('')
  const [confirm, setConfirm] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 8) {
      toast.push({ title: 'סיסמה חלשה', description: 'לפחות 8 תווים.' })
      return
    }
    if (password !== confirm) {
      toast.push({ title: 'הסיסמאות לא תואמות' })
      return
    }
    setLoading(true)
    try {
      await updatePassword(password)
      toast.push({ title: 'הסיסמה עודכנה' })
      nav('/', { replace: true })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.push({ title: 'עדכון נכשל', description: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell relative isolate min-h-dvh overflow-hidden px-4 py-8">
      <div className="login-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,18,0.72),rgba(7,11,18,0.96))]" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md items-center">
        <Card className="glass-panel w-full border-white/10 bg-black/40 text-zinc-50 backdrop-blur-xl">
          <CardContent className="space-y-5 p-6 sm:p-8">
            <div className="space-y-2 text-right">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">הגדרת סיסמה חדשה</h1>
              <p className="text-sm leading-6 text-zinc-300">לפחות 8 תווים.</p>
            </div>
            <form onSubmit={onSubmit} className="space-y-3">
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="סיסמה חדשה"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-12 border-white/10 bg-white/5 text-zinc-50"
              />
              <Input
                type="password"
                autoComplete="new-password"
                placeholder="אימות סיסמה"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={8}
                className="h-12 border-white/10 bg-white/5 text-zinc-50"
              />
              <Button
                type="submit"
                disabled={loading || !password}
                className="h-12 w-full rounded-xl border border-amber-300/20 bg-[linear-gradient(180deg,#d4af37,#a97f11)] text-base font-semibold text-[#1a1200]"
              >
                {loading ? 'שומר…' : 'עדכן סיסמה'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
