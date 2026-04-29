import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { Crown, CreditCard, Sparkles, Spade, Zap } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { useToast } from '../../components/ui/use-toast'
import { supabase } from '../../data/supabase/client'
import { useAuth } from '../auth/auth-context'

export function LoginPage() {
  const { user, enabled } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [email, setEmail] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (enabled && user) navigate('/', { replace: true })
  }, [enabled, user, navigate])

  async function sendMagicLink(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const sb = supabase()
      const redirectTo = window.location.origin
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo },
      })
      if (error) throw error
      toast.push({ title: 'הקישור נשלח', description: 'בדקו את האימייל ופתחו את קישור הכניסה.' })
      setEmail('')
    } catch (err: any) {
      toast.push({ title: 'הכניסה נכשלה', description: String(err?.message ?? err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-shell relative isolate min-h-dvh overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="login-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,136,0.14),transparent_32%),radial-gradient(circle_at_85%_18%,rgba(212,175,55,0.14),transparent_18%),linear-gradient(180deg,rgba(7,11,18,0.72),rgba(7,11,18,0.96))]" />

      <div className="relative z-10 mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="space-y-8 text-center lg:text-start">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-white/5 px-4 py-2 text-xs font-medium text-amber-100 shadow-[0_0_30px_rgba(212,175,55,0.12)] backdrop-blur">
              <Sparkles className="h-4 w-4 text-amber-300" />
              Premium poker operations · RTL-first
            </div>

            <div className="space-y-4">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-300/20 bg-[linear-gradient(180deg,rgba(26,71,42,0.75),rgba(7,11,18,0.9))] shadow-[0_0_80px_rgba(0,255,136,0.12)] lg:mx-0">
                <Spade className="h-9 w-9 text-emerald-300" />
              </div>
              <h1 className="brand-glow text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
                Poker Ledger
              </h1>
              <p className="mx-auto max-w-xl text-base leading-8 text-zinc-300 lg:mx-0 lg:text-lg">
                מערכת ניהול שולחנות פוקר בעברית, עם תחושת קזינו יוקרתית, זרימה נקייה, וקישור כניסה מהיר.
              </p>
            </div>

            <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-3 lg:mx-0">
              {[
                { icon: Crown, title: 'מראה יוקרתי', text: 'גוונים כהים, זהב וניאון עדין.' },
                { icon: CreditCard, title: 'כניסה חכמה', text: 'Magic link פשוט ומאובטח.' },
                { icon: Zap, title: 'תחושה חיה', text: 'אנימציות עדינות שמרגישות premium.' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="glass-panel rounded-2xl p-4 text-right shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                  <Icon className="mb-3 h-5 w-5 text-amber-300" />
                  <div className="text-sm font-semibold text-zinc-50">{title}</div>
                  <div className="mt-1 text-sm leading-6 text-zinc-400">{text}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="relative mx-auto w-full max-w-md lg:mx-0 lg:justify-self-end">
            <div className="card-drift pointer-events-none absolute -left-6 top-10 hidden h-36 w-28 rotate-[-12deg] rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:block" />
            <div className="chip-orbit pointer-events-none absolute -right-8 top-0 hidden h-20 w-20 sm:block" />

            <Card className="glass-panel border-white/10 bg-black/35 text-zinc-50 shadow-[0_35px_100px_rgba(0,0,0,0.55)] backdrop-blur-xl">
              <CardContent className="space-y-6 p-6 sm:p-8">
                <div className="space-y-2 text-right">
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs text-emerald-100">
                    <Sparkles className="h-3.5 w-3.5" />
                    הכניסה לחשבון
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">שליחת קישור כניסה</h2>
                  <p className="text-sm leading-6 text-zinc-300">
                    קבלו קישור חד־פעמי לאימייל וחזרו ישר לשולחן.
                  </p>
                </div>

                <form onSubmit={sendMagicLink} className="space-y-3">
                  <label className="block text-right text-sm font-medium text-zinc-200" htmlFor="email">
                    אימייל
                  </label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 border-white/10 bg-white/5 text-base text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-emerald-300"
                  />
                  <Button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-amber-300/20 bg-[linear-gradient(180deg,#d4af37,#a97f11)] text-base font-semibold text-[#1a1200] shadow-[0_18px_60px_rgba(212,175,55,0.28)] hover:bg-[linear-gradient(180deg,#e3bf4e,#b88c17)]"
                  >
                    {loading ? 'שולח…' : 'שליחת קישור כניסה'}
                  </Button>
                </form>

                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-100">
                    <Spade className="h-4 w-4 text-emerald-300" />
                    Poker Ledger
                  </div>
                  <div className="mt-2 text-sm leading-6 text-zinc-400">
                    כניסה מהירה, עיצוב כהה ומלוטש, ותחושה של קזינו מודרני בכל מסך.
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
