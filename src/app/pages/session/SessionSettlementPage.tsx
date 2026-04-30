import { useNavigate } from 'react-router-dom'

import { useRoster } from '../../hooks/useRoster'
import { useSession } from '../../hooks/useSession'
import { useOnboarding } from '../../onboarding/useOnboarding'
import { OnboardingBanner } from '../../onboarding/OnboardingBanner'
import { computeSettlement } from '../../../domain/settlement'
import { delta, totalBuyinForPlayer, totalBuyins, totalCashouts } from '../../../domain/session'
import { ils } from '../../../lib/money'
import { copyText } from '../../../lib/clipboard'
import { useToast } from '../../../components/ui/use-toast'

export function SessionSettlementPage() {
  const toast = useToast()
  const { roster } = useRoster()
  const { session, loading, error } = useSession()
  const nav = useNavigate()
  const ob = useOnboarding(session)

  if (loading) return <div className="text-body-sm font-body-sm text-on-surface-variant">טוען…</div>
  if (error || !session) return <div className="text-body-sm font-body-sm text-error">לא הצלחנו לטעון סגירה</div>

  const d = delta(session)
  const balanced = Math.abs(d) < 0.0001

  const transfers = computeSettlement(
    session.participantIds.map((pid) => ({
      playerId: pid,
      net: (session.cashouts[pid] || 0) - totalBuyinForPlayer(session, pid),
    })),
  )

  function playerName(pid: string) {
    return roster.find((p) => p.id === pid)?.name || pid
  }

  async function copyTransfer(t: { fromPlayerId: string; toPlayerId: string; amount: number }) {
    const text = `${playerName(t.fromPlayerId)} → ${playerName(t.toPlayerId)}: ${ils(t.amount)}`
    await copyText(text)
    toast.push({ title: 'הועתק', description: text })
  }

  async function payWithBit(t: { fromPlayerId: string; toPlayerId: string; amount: number }) {
    const text = `בקשת תשלום: ${playerName(t.fromPlayerId)} מעביר/ה ל-${playerName(t.toPlayerId)} סכום ${ils(t.amount)}`
    await copyText(text)

    const target = 'https://www.bitpay.co.il/'
    const win = window.open(target, '_blank', 'noopener,noreferrer')
    if (!win) {
      window.location.href = target
    }
    toast.push({ title: 'נפתחה אפליקציית Bit', description: 'נוסח הבקשה הועתק ללוח.' })
  }

  return (
    <div className="bg-background text-on-background font-body-lg antialiased pb-24">
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

      <main className="flex flex-col gap-section-margin">
        {/* Summary Card */}
        <section className="rounded-xl p-[1px] bg-gradient-to-l from-[#D4AF37]/35 via-[#D4AF37]/10 to-[#D4AF37]/35">
          <div className="bg-primary-container/90 backdrop-blur-sm rounded-xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <h2 className="font-label-caps text-label-caps text-on-surface-variant mb-4 uppercase text-center">סיכום קופה</h2>
          <div className="flex justify-between items-center mb-6">
            <div className="text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant">סך הכל נכנס</p>
              <p className="font-data-tabular text-data-tabular text-primary">{ils(totalBuyins(session))}</p>
            </div>
            <div className="h-12 w-px bg-[rgba(212,175,55,0.15)]" />
            <div className="text-center">
              <p className="font-body-sm text-body-sm text-on-surface-variant">סך הכל יצא</p>
              <p className="font-data-tabular text-data-tabular text-primary">{ils(totalCashouts(session))}</p>
            </div>
          </div>
          <div className="flex justify-center">
            <div
              className={
                'px-4 py-2 rounded-full border flex items-center gap-2 ' +
                (balanced ? 'bg-surface-container-highest border-primary text-primary' : 'bg-error-container/10 border-error/30 text-error')
              }
            >
              <span className="material-symbols-outlined text-sm">{balanced ? 'check_circle' : 'error'}</span>
              <span className="font-body-sm text-body-sm">{balanced ? `הקופה מאוזנת (הפרש ${ils(d)})` : `הפרש: ${ils(d)}`}</span>
            </div>
          </div>
          </div>
        </section>

        {/* Required Transfers */}
        <section>
          <h2 className="font-headline-md text-headline-md text-on-background mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary">swap_horiz</span>
            העברות נדרשות
          </h2>

          {transfers.length === 0 ? (
            <div className="text-body-sm font-body-sm text-on-surface-variant">אין העברות 🎉</div>
          ) : (
            <div className="flex flex-col gap-stack-gap">
              {transfers.map((t) => (
                <div
                  key={`${t.fromPlayerId}-${t.toPlayerId}-${t.amount}`}
                  className="bg-surface-container/90 backdrop-blur-sm rounded-lg border border-outline-variant/40 p-4 flex flex-col gap-4 relative overflow-hidden motion-safe:animate-cardSlideIn transition-all duration-200"
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-tertiary" />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center border border-outline-variant">
                        <span className="font-label-caps text-label-caps text-on-surface">
                          {playerName(t.fromPlayerId).slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="font-body-lg text-body-lg text-on-surface">{playerName(t.fromPlayerId)}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                          מעביר ל
                          <span className="material-symbols-outlined text-sm">arrow_left_alt</span>
                          {playerName(t.toPlayerId)}
                        </p>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="font-data-tabular text-data-tabular text-tertiary">{ils(t.amount)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => copyTransfer(t)}
                      className="flex-1 bg-surface-container-highest hover:bg-surface-variant transition-all duration-200 active:scale-[0.98] py-2 rounded-lg border border-outline-variant flex items-center justify-center gap-2 font-body-sm text-body-sm text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <span className="material-symbols-outlined text-sm">content_copy</span>
                      העתק בקשה
                    </button>
                    <button
                      type="button"
                      onClick={() => payWithBit(t)}
                      className="flex-1 bg-[#10B1B0] hover:opacity-90 transition-all duration-200 active:scale-[0.98] py-2 rounded-lg flex items-center justify-center gap-2 font-body-sm text-body-sm text-white font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      שלם ב-Bit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Action Button */}
        <div className="mt-4 pb-8">
          <button
            type="button"
            className="w-full bg-[#2D6A4F] text-white py-4 rounded-xl font-headline-md text-headline-md flex justify-center items-center gap-2 hover:bg-[#1B4332] transition-all duration-200 active:scale-[0.98] shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[rgba(212,175,55,0.3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tertiary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-safe:animate-slideUp"
            onClick={() => nav(`/session/${session.id}/export`)}
          >
            <span className="material-symbols-outlined">share</span>
            שתף סיכום
          </button>
        </div>
      </main>
    </div>
  )
}
