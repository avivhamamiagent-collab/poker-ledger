import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, UsersRound } from 'lucide-react'

import { Button } from '../../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { useToast } from '../../../components/ui/use-toast'
import { useStore } from '../../store-context'

export function CreateGroupPage() {
  const store = useStore()
  const toast = useToast()
  const nav = useNavigate()

  const [name, setName] = React.useState('')
  const [creating, setCreating] = React.useState(false)

  async function onCreate() {
    const n = name.trim()
    if (!n) return

    setCreating(true)
    try {
      const g = await store.createGroup(n)
      toast.push({ title: 'קבוצה נוצרה' })
      nav(`/group/${g.id}`, { replace: true })
    } catch (err: unknown) {
      toast.push({ title: 'יצירת קבוצה נכשלה', description: err instanceof Error ? err.message : String(err) })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-5 pb-10">
      <section className="gold-bezel overflow-hidden rounded-2xl bg-surface-container-low/78 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.34)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-tertiary">קבוצה חדשה</div>
            <h1 className="text-2xl font-black text-on-surface">יצירת קבוצת פוקר</h1>
            <p className="mt-1 text-sm leading-6 text-on-surface-variant">תן שם לקבוצה, ואז תוכל להזמין חברים ולתאם משחקים.</p>
          </div>
          <Button variant="secondary" onClick={() => nav('/groups')}>
            חזרה
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersRound className="h-5 w-5 text-tertiary" />
            פרטי קבוצה
          </CardTitle>
          <CardDescription>אפשר להתחיל בשם בלבד ולעדכן בהמשך.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            id="group-name"
            placeholder="לדוגמה: כרישי יום חמישי"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button onClick={() => onCreate()} disabled={creating || !name.trim()}>
            {creating ? 'יוצר…' : 'צור קבוצה'}
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 text-sm leading-6 text-on-surface-variant">
          אחרי יצירת הקבוצה ניתן להזמין חברים באימייל, ליצור משחק חדש ולנהל RSVP להערב.
        </CardContent>
      </Card>
    </div>
  )
}
