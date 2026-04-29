import { useNavigate } from 'react-router-dom'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { createSession } from '../../domain/session'
import { useStore } from '../store-context'
import { useOnboarding } from '../onboarding/useOnboarding'

export function OnboardingPage() {
  const store = useStore()
  const nav = useNavigate()
  const ob = useOnboarding()

  async function onStart() {
    const s = createSession(undefined)
    await store.putSession(s)
    ob.start(s.id)
    nav(`/session/${s.id}/participants?ob=1`)
  }

  return (
    <Card className="border-white/10 bg-white/5 text-zinc-50">
      <CardHeader>
        <CardTitle className="text-2xl">התחלה מהירה (2 דקות)</CardTitle>
        <CardDescription className="text-zinc-300">פותחים שולחן ראשון ומתקדמים שלב-שלב עד סגירה.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="list-disc pr-5 text-sm text-zinc-200">
          <li>מוסיפים משתתפים</li>
          <li>רושמים כניסות וריבאים</li>
          <li>רושמים יציאות וסוגרים ערב</li>
        </ul>
        <div className="flex gap-2">
          <Button onClick={onStart}>פתח שולחן</Button>
          <Button variant="secondary" onClick={() => nav('/')}>דלג</Button>
        </div>
      </CardContent>
    </Card>
  )
}
