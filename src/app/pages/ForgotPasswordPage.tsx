import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { useToast } from '../../components/ui/use-toast'
import { requestPasswordReset } from '../auth/auth-context'

export function ForgotPasswordPage() {
  const toast = useToast()
  const nav = useNavigate()

  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await requestPasswordReset(email.trim())
      setSent(true)
      toast.push({ title: 'נשלח מייל איפוס', description: 'בדוק את תיבת המייל שלך.' })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      toast.push({ title: 'נכשל לשלוח מייל', description: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell relative isolate min-h-dvh overflow-hidden px-4 py-8">
      <div className="login-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,18,0.72),rgba(7,11,18,0.96))]" />
      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md items-center">
        <Card className="glass-panel w-full border-white/10 bg-black/40 text-zinc-50 shadow-[0_35px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl">
          <CardContent className="space-y-5 p-6 sm:p-8">
            <div className="space-y-2 text-right">
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">איפוס סיסמה</h1>
              <p className="text-sm leading-6 text-zinc-300">
                {sent
                  ? 'נשלח לך מייל עם קישור לאיפוס. אם לא הגיע תוך כמה דקות, בדוק בספאם.'
                  : 'הכנס את האימייל שלך ונשלח קישור לאיפוס.'}
              </p>
            </div>
            {!sent && (
              <form onSubmit={onSubmit} className="space-y-3">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 border-white/10 bg-white/5 text-base text-zinc-50 placeholder:text-zinc-500"
                />
                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="h-12 w-full rounded-xl border border-amber-300/20 bg-[linear-gradient(180deg,#d4af37,#a97f11)] text-base font-semibold text-[#1a1200]"
                >
                  {loading ? 'שולח…' : 'שלח קישור'}
                </Button>
              </form>
            )}
            <div className="flex items-center justify-between text-sm text-zinc-400">
              <Link to="/login" className="inline-flex items-center gap-1 hover:text-zinc-200">
                <ArrowLeft className="h-4 w-4" />
                חזרה לכניסה
              </Link>
              {sent && (
                <button type="button" onClick={() => nav('/login')} className="hover:text-zinc-200">
                  סיימתי
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
