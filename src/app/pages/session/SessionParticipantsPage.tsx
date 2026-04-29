import * as React from 'react'
import { CheckCircle2, Circle, UserPlus } from 'lucide-react'

import type { Player } from '../../../domain/types'
import { addParticipant, removeParticipant } from '../../../domain/session'
import { rosterKey } from '../../../domain/roster-key'
import { id } from '../../../domain/ids'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import { useRoster } from '../../hooks/useRoster'
import { useSession } from '../../hooks/useSession'
import { useStore } from '../../store-context'
import { useToast } from '../../../components/ui/use-toast'
import { OnboardingBanner } from '../../onboarding/OnboardingBanner'
import { useNavigate } from 'react-router-dom'
import { useOnboarding } from '../../onboarding/useOnboarding'

export function SessionParticipantsPage() {
  const store = useStore()
  const toast = useToast()
  const nav = useNavigate()
  const { roster, refresh: refreshRoster } = useRoster()
  const { session, loading, error, persist } = useSession()
  const ob = useOnboarding(session)

  const [name, setName] = React.useState('')
  const [phone, setPhone] = React.useState('')

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>טוען…</CardTitle>
        </CardHeader>
      </Card>
    )
  }
  if (error || !session) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>לא הצלחנו לטעון משתתפים</CardTitle>
          {error && <CardDescription>{error}</CardDescription>}
        </CardHeader>
      </Card>
    )
  }

  const s = session

  async function quickAddAndSelect() {
    const n = name.trim()
    if (!n) return

    const key = rosterKey({ name: n, phone })
    const existing = roster.find((p) => rosterKey(p) === key)
    const p: Player = existing || { id: id('ply'), name: n, phone: phone.trim() || undefined }
    if (!existing) {
      await store.putPlayer(p)
      await refreshRoster()
    }

    await persist(addParticipant(s, p.id, p.name))
    setName('')
    setPhone('')
    toast.push({ title: 'משתתף נוסף', description: p.name })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>משתתפים</CardTitle>
        <CardDescription>בחרו מי נכנס לחישוב כניסות, סגירות והפרש.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ob.obActive && ob.state.activeSessionId === s.id && !ob.state.done ? (
          <OnboardingBanner
            stepLabel="התחלה מהירה • שלב 1/4"
            title="מוסיפים משתתפים"
            body="תוסיף לפחות 2 שחקנים. אפשר ‘הוספה + בחירה’ וזה נשמר לרוסטר לפעמים הבאות."
            primaryLabel="המשך לכניסות"
            primaryDisabled={s.participantIds.length < 2}
            onPrimary={() => {
              ob.setStep('entries')
              nav(`/session/${s.id}/entries?ob=1`)
            }}
            secondaryLabel="דלג"
            onSecondary={() => ob.complete()}
          />
        ) : null}

        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-800 dark:bg-zinc-900/30">
          <div className="text-sm font-semibold">הוספה מהירה לרוסטר</div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Input placeholder="שם" value={name} onChange={(e) => setName(e.target.value)} />
            <Input placeholder="טלפון (אופציונלי)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="mt-2">
            <Button onClick={quickAddAndSelect} disabled={!name.trim()}>
              <UserPlus className="h-4 w-4" />
              הוספה + בחירה
            </Button>
          </div>
        </div>

        {roster.length === 0 ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">הרוסטר ריק. הוסיפו מישהו למעלה.</div>
        ) : (
          <div className="grid gap-2">
            {roster.map((p) => {
              const checked = s.participantIds.includes(p.id)
              return (
                <button
                  key={p.id}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-zinc-200 bg-white p-3 text-left hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900/40"
                  onClick={async () => {
                    const next = checked
                      ? removeParticipant(s, p.id, p.name)
                      : addParticipant(s, p.id, p.name)
                    await persist(next)
                  }}
                >
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{p.name}</div>
                    {p.phone && <div className="truncate text-xs text-zinc-500 dark:text-zinc-400">{p.phone}</div>}
                  </div>
                  <div className="shrink-0 text-zinc-500 dark:text-zinc-400">
                    {checked ? <CheckCircle2 className="h-5 w-5 text-emerald-600" /> : <Circle className="h-5 w-5" />}
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {s.participantIds.length > 0 && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            פעילים: {s.participantIds.length} משתתפים
          </div>
        )}
      </CardContent>
    </Card>
  )
}
