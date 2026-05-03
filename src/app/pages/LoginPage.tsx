import * as React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ListChecks, Spade, UsersRound } from 'lucide-react'

import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { useToast } from '../../components/ui/use-toast'
import { signIn, signUp, useAuth } from '../auth/auth-context'

export function LoginPage() {
  const { user, enabled } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [displayName, setDisplayName] = React.useState('')
  const [isSignUp, setIsSignUp] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (user) navigate('/', { replace: true })
  }, [user, navigate])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!enabled) {
      navigate('/', { replace: true })
      return
    }
    setLoading(true)
    try {
      if (isSignUp) {
        const user = await signUp(email, password, displayName)
        if (!user) {
          toast.push({ title: 'נרשמת בהצלחה', description: 'יש לאשר את האימייל לפני הכניסה.' })
          return
        }
        toast.push({ title: 'נרשמת בהצלחה', description: 'ברוכים הבאים לפנקס פוקר.' })
      } else {
        await signIn(email, password)
        toast.push({ title: 'הכניסה הצליחה', description: 'מעביר אותך לאפליקציה…' })
      }
    } catch (err: unknown) {
      const raw = err instanceof Error ? err.message : String(err)
      const msg = hebrewAuthError(raw, isSignUp)
      // If email is already registered while in signup mode → auto-switch to login
      if (isSignUp && /already registered|user already exists/i.test(raw)) {
        setIsSignUp(false)
        toast.push({ title: 'אימייל כבר רשום', description: 'עברנו למסך הכניסה — הכנס את הסיסמה שלך.' })
      } else {
        toast.push({ title: isSignUp ? 'ההרשמה נכשלה' : 'הכניסה נכשלה', description: msg })
      }
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
              <Spade className="h-4 w-4 text-amber-300" />
              ניהול ערב פוקר בעברית
            </div>

            <div className="space-y-4">
              <div className="chip-stage relative mx-auto h-36 w-36 lg:mx-0">
                <div className="absolute inset-0 rounded-full bg-tertiary/12 blur-3xl" />
                <div className="spinning-chip-flat absolute inset-4 grid place-items-center rounded-full text-[#061811]">
                  <Spade className="h-9 w-9 drop-shadow" />
                </div>
                <span className="orbit-spark absolute left-1/2 top-1/2 h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_20px_rgba(110,231,183,0.8)]" aria-hidden />
              </div>
              <h1 className="brand-glow text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl lg:text-6xl">
                פנקס פוקר
              </h1>
              <p className="mx-auto max-w-xl text-base leading-8 text-zinc-300 lg:mx-0 lg:text-lg">
                פותחים שולחן, מוסיפים שחקנים, רושמים כניסות וסגירות, ומקבלים בסוף מי צריך להעביר למי.
              </p>
            </div>

            <div className="mx-auto grid max-w-2xl gap-3 sm:grid-cols-3 lg:mx-0">
              {[
                { icon: UsersRound, title: 'שחקנים', text: 'רוסטר קבוע לכל הערבים.' },
                { icon: ListChecks, title: 'חישוב', text: 'ריבאים, קאשאאוט והפרש קופה.' },
                { icon: ArrowLeft, title: 'סגירה', text: 'סיכום והעברות בסוף המשחק.' },
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
                    <ListChecks className="h-3.5 w-3.5" />
                    {enabled ? (isSignUp ? 'הרשמה חדשה' : 'כניסה לחשבון') : 'מצב מקומי פעיל'}
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">
                    {enabled ? (isSignUp ? 'צור חשבון' : 'שמחים לראות אותך') : 'כניסה מהירה'}
                  </h2>
                  <p className="text-sm leading-6 text-zinc-300">
                    {enabled
                      ? (isSignUp
                        ? 'הרשמה מהירה עם אימייל וסיסמה. אחרי זה נשארים מחוברים.'
                        : 'הכנס אימייל וסיסמה וקדימה לשחק.')
                      : 'האפליקציה מוגדרת לשמירה מקומית. אין צורך בחשבון כדי להתחיל לעבוד.'}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  {enabled && isSignUp && (
                    <div className="space-y-1.5">
                      <label className="block text-right text-sm font-medium text-zinc-200" htmlFor="displayName">
                        שם תצוגה
                      </label>
                      <Input
                        id="displayName"
                        type="text"
                        autoComplete="name"
                        placeholder="אביב"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        required
                        className="h-12 border-white/10 bg-white/5 text-base text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-emerald-300"
                      />
                    </div>
                  )}
                  {enabled ? (
                  <div className="space-y-1.5">
                    <label className="block text-right text-sm font-medium text-zinc-200" htmlFor="email">
                      אימייל
                    </label>
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="name@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 border-white/10 bg-white/5 text-base text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-emerald-300"
                    />
                  </div>
                  ) : null}
                  {enabled ? (
                  <div className="space-y-1.5">
                    <label className="block text-right text-sm font-medium text-zinc-200" htmlFor="password">
                      סיסמה
                    </label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 border-white/10 bg-white/5 text-base text-zinc-50 placeholder:text-zinc-500 focus-visible:ring-emerald-300"
                    />
                  </div>
                  ) : null}
                  <Button
                    type="submit"
                    disabled={loading}
                    className="relative h-12 w-full overflow-hidden rounded-xl border border-amber-300/20 bg-[linear-gradient(180deg,#d4af37,#a97f11)] text-base font-semibold text-[#1a1200] shadow-[0_18px_60px_rgba(212,175,55,0.28)] hover:bg-[linear-gradient(180deg,#e3bf4e,#b88c17)]"
                  >
                    {loading ? 'רגע…' : enabled ? (isSignUp ? 'הרשמה' : 'כניסה') : 'כניסה לאפליקציה'}
                    <ArrowLeft className="relative z-10 h-4 w-4" />
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.45),transparent)] bg-[length:200%_100%] opacity-35 motion-safe:animate-shimmer"
                    />
                  </Button>
                  {enabled ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="w-full text-center text-sm text-zinc-400 hover:text-zinc-200"
                      >
                        {isSignUp ? 'כבר יש חשבון? כניסה' : 'אין חשבון? הרשמה'}
                      </button>
                      {!isSignUp && (
                        <Link
                          to="/forgot-password"
                          className="block w-full text-center text-xs text-zinc-500 hover:text-zinc-300"
                        >
                          שכחת סיסמה?
                        </Link>
                      )}
                    </div>
                  ) : null}
                </form>

                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-100">
                    <Spade className="h-4 w-4 text-emerald-300" />
                    מה עושים כאן?
                  </div>
                  <div className="mt-2 text-sm leading-6 text-zinc-400">
                    מחליפים דף אקסל והודעות וואטסאפ במסך אחד שמנהל את הכסף של הערב.
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

function hebrewAuthError(msg: string, isSignUp: boolean): string {
  if (/already registered|user already exists/i.test(msg))
    return 'האימייל הזה כבר רשום. נסה להיכנס עם הסיסמה שלך.'
  if (/invalid login credentials|invalid password|wrong password/i.test(msg))
    return 'אימייל או סיסמה שגויים. נסה שנית.'
  if (/email not confirmed/i.test(msg))
    return 'יש לאשר את האימייל לפני הכניסה. בדוק את תיבת הדואר שלך.'
  if (/password should be at least/i.test(msg))
    return 'הסיסמה חייבת להכיל לפחות 6 תווים.'
  if (/rate limit|too many requests/i.test(msg))
    return 'יותר מדי ניסיונות. המתן כמה דקות ונסה שנית.'
  if (/network|fetch|failed to fetch/i.test(msg))
    return 'בעיית חיבור לרשת. בדוק את האינטרנט ונסה שנית.'
  return isSignUp ? `ההרשמה נכשלה: ${msg}` : `הכניסה נכשלה: ${msg}`
}
