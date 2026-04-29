import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { useRoster } from '../../hooks/useRoster'
import { useSession } from '../../hooks/useSession'
import { participantsForSession } from '../../../domain/selectors'
import { delta } from '../../../domain/session'
import { ils } from '../../../lib/money'
import { OnboardingBanner } from '../../onboarding/OnboardingBanner'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../onboarding/useOnboarding'

export function SessionSettlementPage() {
  const { roster } = useRoster()
  const { session, loading, error } = useSession()
  const nav = useNavigate()
  const ob = useOnboarding(session)

  if (loading) return <Card><CardHeader><CardTitle>טוען…</CardTitle></CardHeader></Card>
  if (error || !session) return <Card><CardHeader><CardTitle>לא הצלחנו לטעון סגירה</CardTitle></CardHeader></Card>

  const d = delta(session)
  const participants = participantsForSession(session, roster)
  const balanced = Math.abs(d) < 0.0001

  return (
    <Card>
      <CardHeader>
        <CardTitle>סגירה וחלוקה</CardTitle>
        <CardDescription>סיכום מהיר לסיום הערב.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {ob.obActive && ob.state.activeSessionId === session.id && !ob.state.done ? (
          <OnboardingBanner
            stepLabel="התחלה מהירה • שלב 4/4"
            title="סוגרים ערב"
            body={balanced ? 'מעולה — הכול מאוזן. אפשר לייצא ולסיים.' : 'יש הפרש קטן. בדוק כניסות/יציאות אם משהו לא מסתדר.'}
            primaryLabel="מעבר לייצוא"
            onPrimary={() => {
              ob.setStep('done')
              nav(`/session/${session.id}/export?ob=1`)
            }}
            secondaryLabel="סיימתי"
            onSecondary={() => ob.complete()}
          />
        ) : null}

        <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/30">
          הפרש כולל: <span className="font-semibold">{ils(d)}</span>
        </div>
        <div className="grid gap-2">
          {participants.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="font-medium">{p.name}</div>
                <div className="text-xs text-zinc-500">חלוקה ידנית / Bit</div>
              </div>
              <Button variant="secondary" onClick={() => navigator.clipboard.writeText(`${p.name}: ${ils(d)}`)}>העתקת סכום</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
