import * as React from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
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
      toast.push({ title: 'Check your email', description: 'We sent you a magic link to sign in.' })
      setEmail('')
    } catch (err: any) {
      toast.push({ title: 'Sign in failed', description: String(err?.message ?? err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 pt-8">
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Magic link email sign-in (no password).</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={sendMagicLink} className="flex flex-col gap-3">
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send magic link'}
            </Button>
          </form>
          <p className="mt-3 text-xs text-zinc-500">
            If you open the link on mobile, it will bring you back to this app.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
