import * as React from 'react'
import { useNavigate } from 'react-router-dom'

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
    <div className="bg-background text-on-background font-body-sm min-h-screen pb-[120px] antialiased selection:bg-primary/30">
      <main className="pt-4 flex flex-col gap-section-margin">
        {/* Page Header */}
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">יצירת קבוצה חדשה</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">הגדר את סביבת המשחק והזמן שחקנים</p>
        </div>

        {/* Identity Section */}
        <section className="bg-surface-container rounded-xl border border-outline-variant/30 p-5 flex flex-col gap-stack-gap relative overflow-hidden shadow-[0px_4px_20px_rgba(0,0,0,0.3)]">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-tertiary-container/30 to-transparent" />
          <h3 className="font-label-caps text-label-caps text-on-surface-variant mb-2">זהות הקבוצה</h3>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="shrink-0 w-[88px] h-[88px] rounded-full bg-surface-container-high border border-dashed border-primary/40 flex flex-col items-center justify-center gap-1 text-primary hover:bg-primary/10 transition-colors active:scale-95"
            >
              <span className="material-symbols-outlined">add_a_photo</span>
              <span className="font-label-caps text-[10px] text-primary/80">לוגו</span>
            </button>
            <div className="flex-1 flex flex-col gap-1">
              <label className="font-label-caps text-label-caps text-on-surface-variant/80 px-1" htmlFor="group-name">
                שם הקבוצה
              </label>
              <input
                id="group-name"
                className="w-full bg-surface-container-lowest text-on-surface font-body-lg text-body-lg border-b border-outline-variant/50 focus:border-primary outline-none px-3 py-2 transition-colors placeholder:text-on-surface-variant/40"
                placeholder="לדוגמה: כרישי יום חמישי"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Players Section */}
        <section className="bg-surface-container rounded-xl border border-outline-variant/30 p-5 flex flex-col gap-stack-gap shadow-[0px_4px_20px_rgba(0,0,0,0.3)]">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant">שחקנים התחלתיים</h3>
            <span className="font-body-sm text-[12px] text-primary bg-primary-container px-2 py-0.5 rounded-full">מנהל אחד</span>
          </div>
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center justify-between p-3 bg-surface-container-high rounded-lg border border-outline-variant/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-data-tabular text-data-tabular">
                  א
                </div>
                <div className="flex flex-col">
                  <span className="font-body-lg text-body-lg text-on-surface">אני (מנהל)</span>
                  <span className="font-body-sm text-[12px] text-on-surface-variant">נוסף אוטומטית</span>
                </div>
              </div>
              <span className="material-symbols-outlined text-primary/50">verified</span>
            </div>
          </div>
          <div className="rounded-xl border border-tertiary/14 bg-black/14 p-4 text-sm leading-6 text-on-surface-variant">
            אחרי יצירת הקבוצה אפשר להזמין חברים וליצור משחק. במצב מקומי ההזמנות נשמרות בתוך האפליקציה, ובמצב Supabase הן נשלחות לקבוצה בענן.
          </div>
        </section>
      </main>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 w-full px-container-padding pb-8 pt-4 bg-background/90 backdrop-blur-lg border-t border-outline-variant/20 z-40">
        <button
          type="button"
          onClick={() => onCreate()}
          disabled={creating || !name.trim()}
          className="w-full h-touch-target bg-primary-container text-primary font-headline-md text-headline-md rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(27,67,50,0.5)] active:scale-[0.98] transition-all border border-primary/20 hover:bg-primary hover:text-on-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined">add_circle</span>
          {creating ? 'יוצר…' : 'צור קבוצה'}
        </button>
      </div>
    </div>
  )
}
