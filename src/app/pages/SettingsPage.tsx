import { useNavigate } from 'react-router-dom'

import { useToast } from '../../components/ui/use-toast'
import { getEnv } from '../../config/env'

export function SettingsPage() {
  const nav = useNavigate()
  const toast = useToast()
  const env = getEnv()

  return (
    <div className="bg-background text-on-background min-h-screen antialiased selection:bg-primary/20">
      <main className="flex flex-col gap-section-margin">
        <section>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">הגדרות מערכת</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant">ניהול העדפות, תצוגה ונתוני אפליקציה.</p>
        </section>

        <section className="grid grid-cols-2 gap-stack-gap">
          <div className="col-span-1 bg-surface-container rounded-2xl p-4 border border-outline/10 shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden group hover:border-primary/30 transition-colors active:scale-[0.98]">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">language</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">expand_more</span>
            </div>
            <div>
              <h3 className="font-body-sm text-body-sm text-on-surface-variant mb-1">שפת ממשק</h3>
              <p className="font-data-tabular text-data-tabular text-on-surface">עברית</p>
            </div>
          </div>

          <div className="col-span-1 bg-surface-container rounded-2xl p-4 border border-outline/10 shadow-sm flex flex-col justify-between min-h-[140px] relative overflow-hidden opacity-90">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-tertiary">payments</span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/50 text-sm">lock</span>
            </div>
            <div>
              <h3 className="font-body-sm text-body-sm text-on-surface-variant mb-1">מטבע בסיס</h3>
              <p className="font-data-tabular text-data-tabular text-tertiary">₪ (ILS)</p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-tertiary/5 to-transparent pointer-events-none" />
          </div>

          <div className="col-span-2 bg-surface-container rounded-2xl p-5 border border-outline/10 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-sm">cloud_sync</span>
              </div>
              <h3 className="font-body-lg text-body-lg text-on-surface">אחסון וסנכרון</h3>
            </div>

            <div className="flex bg-surface-container-highest p-1 rounded-xl w-full relative">
              <div
                className={
                  'absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-primary-container rounded-lg shadow-sm transition-all duration-300 border border-primary/20 ' +
                  (env.storage === 'supabase' ? 'translate-x-full' : 'translate-x-0')
                }
              />
              <button
                type="button"
                onClick={() => toast.push({ title: 'מצב אחסון נקבע בקונפיג', description: `כעת: ${env.storage}` })}
                className="relative z-10 flex-1 py-2 text-center font-body-sm text-body-sm text-on-primary-container font-medium"
              >
                ענן (מומלץ)
              </button>
              <button
                type="button"
                onClick={() => toast.push({ title: 'מצב אחסון נקבע בקונפיג', description: `כעת: ${env.storage}` })}
                className="relative z-10 flex-1 py-2 text-center font-body-sm text-body-sm text-on-surface-variant"
              >
                מקומי בלבד
              </button>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant/70 text-xs mt-1">
              כרגע מצב האחסון נקבע בזמן build/deploy. כדי לשנות — צריך לעדכן ENV.
            </p>
          </div>

          <button
            type="button"
            onClick={() => nav('/profile')}
            className="col-span-2 bg-surface-container rounded-2xl p-5 border border-outline/10 shadow-sm flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center">
                <span className="material-symbols-outlined text-on-surface">help</span>
              </div>
              <div className="text-right">
                <h3 className="font-body-lg text-body-lg text-on-surface">מרכז תמיכה</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">שאלות נפוצות ויצירת קשר</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant transform rotate-90">expand_less</span>
          </button>

          <div className="col-span-2 mt-4">
            <h4 className="font-label-caps text-label-caps text-error mb-3 px-1 uppercase tracking-widest">אזור מסוכן</h4>
            <button
              type="button"
              className="w-full bg-error-container/20 border border-error/30 rounded-2xl p-4 flex items-center justify-center gap-3 text-error opacity-70 cursor-not-allowed"
              disabled
            >
              <span className="material-symbols-outlined">delete_forever</span>
              <span className="font-headline-md text-headline-md text-base">מחיקת כל הנתונים</span>
            </button>
            <p className="text-center font-body-sm text-body-sm text-on-surface-variant/60 mt-3 px-4 text-xs">
              כרגע פעולה זו מושבתת כדי למנוע מחיקה לא מכוונת.
            </p>
          </div>
        </section>
      </main>
    </div>
  )
}
