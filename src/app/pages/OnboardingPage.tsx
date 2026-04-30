import { useNavigate } from 'react-router-dom'

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { createSession } from '../../domain/session'
import { useStore } from '../store-context'
import { useOnboarding } from '../onboarding/useOnboarding'
import { useToast } from '../../components/ui/use-toast'

export function OnboardingPage() {
  const store = useStore()
  const nav = useNavigate()
  const ob = useOnboarding()
  const toast = useToast()

  async function onStart() {
    try {
      const s = createSession(undefined)
      await store.putSession(s)
      ob.start(s.id)
      nav(`/session/${s.id}/participants?ob=1`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'יצירת שולחן נכשלה'
      toast.push({ title: 'לא הצלחנו לפתוח שולחן', description: msg })
    }
  }

  return (
    <Card className="gold-bezel">
      <CardHeader className="items-center text-center">
        <div className="chip-stage relative mb-2 h-24 w-24">
          <div className="spinning-chip-flat absolute inset-1 rounded-full" />
        </div>
        <CardTitle className="text-2xl font-black">התחלה מהירה (2 דקות)</CardTitle>
        <CardDescription>פותחים שולחן ראשון ומתקדמים שלב-שלב עד סגירה.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          {[
            ['group_add', 'מוסיפים משתתפים'],
            ['payments', 'רושמים כניסות וריבאים'],
            ['task_alt', 'רושמים יציאות וסוגרים ערב'],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3 rounded-xl border border-tertiary/12 bg-black/14 p-3 text-sm text-on-surface">
              <span className="material-symbols-outlined text-tertiary">{icon}</span>
              <span>{text}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button onClick={onStart}>פתח שולחן</Button>
          <Button variant="secondary" onClick={() => nav('/')}>דלג</Button>
        </div>
      </CardContent>
    </Card>
  )
}
