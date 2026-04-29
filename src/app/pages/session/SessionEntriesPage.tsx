import { Minus, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { useRoster } from '../../hooks/useRoster'
import { useSession } from '../../hooks/useSession'
import { useOnboarding } from '../../onboarding/useOnboarding'
import { OnboardingBanner } from '../../onboarding/OnboardingBanner'
import { participantsForSession } from '../../../domain/selectors'
import { addRebuyUnits, setBuyin, setRebuyUnits, totalBuyinForPlayer, totalBuyins } from '../../../domain/session'
import { REBUY_UNIT_ILS } from '../../../domain/types'
import { ils } from '../../../lib/money'

export function SessionEntriesPage() {
  const { roster } = useRoster()
  const { session, loading, error, persist } = useSession()
  const nav = useNavigate()
  const ob = useOnboarding(session)

  if (loading) {
    return <div className="text-body-sm font-body-sm text-on-surface-variant">טוען…</div>
  }
  if (error || !session) {
    return <div className="text-body-sm font-body-sm text-error">לא הצלחנו לטעון כניסות</div>
  }

  const participants = participantsForSession(session, roster)
  const pot = totalBuyins(session)

  const hasEntries =
    Object.values(session.buyins || {}).some((v) => v > 0) || Object.values(session.rebuyUnits || {}).some((v) => v > 0)

  return (
    <>
      {ob.obActive && ob.state.activeSessionId === session.id && !ob.state.done ? (
        <OnboardingBanner
          stepLabel="התחלה מהירה • שלב 2/4"
          title="רושמים כניסות"
          body="לכל שחקן: כניסה ראשונית + מספר ריבאים. המטרה: סה״כ כניסות יהיה מדויק."
          primaryLabel="המשך ליציאות"
          primaryDisabled={!hasEntries}
          onPrimary={() => {
            ob.setStep('cashout')
            nav(`/session/${session.id}/cashout?ob=1`)
          }}
          secondaryLabel="דלג"
          onSecondary={() => ob.complete()}
        />
      ) : null}

      {/* Header / Pot Section */}
      <section className="flex flex-col items-center gap-stack-gap">
        <div className="text-center">
          <h2 className="text-headline-lg font-headline-lg text-on-surface">חברי השולחן העגול</h2>
          <div className="inline-flex items-center gap-2 mt-1 px-3 py-1 bg-surface-container-high rounded-full border border-outline-variant/30">
            <span className="material-symbols-outlined text-[14px] text-tertiary">casino</span>
            <span className="text-body-sm font-body-sm text-on-surface-variant">בליינדים: 5/10₪</span>
          </div>
        </div>

        <div className="w-full bg-primary-container rounded-xl border border-[#D4AF37]/15 p-6 flex flex-col items-center shadow-[0_4px_20px_rgba(0,0,0,0.5)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/5 to-transparent pointer-events-none" />
          <span className="text-label-caps font-label-caps text-on-primary-container mb-2 relative z-10">קופה כוללת</span>
          <div className="text-display-currency font-display-currency text-tertiary relative z-10 flex items-baseline gap-1" dir="ltr">
            <span>₪</span>
            <span>{pot.toLocaleString('he-IL')}</span>
          </div>
        </div>
      </section>

      {/* Player List */}
      <section className="flex flex-col gap-stack-gap">
        <div className="flex justify-between items-end mb-2 px-1">
          <h3 className="text-body-lg font-body-lg text-on-surface font-semibold">שחקנים פעילים ({participants.length})</h3>
          <span className="text-label-caps font-label-caps text-on-surface-variant">סה"כ קניות: {ils(pot)}</span>
        </div>

        {participants.length === 0 ? (
          <div className="text-body-sm font-body-sm text-on-surface-variant">קודם בוחרים משתתפים.</div>
        ) : (
          <div className="flex flex-col gap-stack-gap">
            {participants.map((p, idx) => {
              const buyin = session.buyins[p.id] || 0
              const units = session.rebuyUnits[p.id] || 0
              const total = totalBuyinForPlayer(session, p.id)
              const net = (session.cashouts[p.id] || 0) - total
              const isWinning = net > 0
              const isLosing = net < 0

              return (
                <div
                  key={p.id}
                  className={
                    idx === 0
                      ? 'bg-surface-container-high rounded-lg border border-[#D4AF37]/30 p-4 flex flex-col gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
                      : 'bg-surface-container rounded-lg border border-outline-variant/20 p-4 flex flex-col gap-3'
                  }
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className={cnAvatar(idx)}>
                        <span className="text-data-tabular font-data-tabular text-on-surface-variant">{p.name.slice(0, 2)}</span>
                        {idx === 0 ? (
                          <div className="absolute -bottom-1 -right-1 bg-surface-container-high rounded-full">
                            <span
                              className="material-symbols-outlined text-[16px] text-tertiary"
                              style={{ fontVariationSettings: '"FILL" 1' } as any}
                            >
                              star
                            </span>
                          </div>
                        ) : null}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-data-tabular font-data-tabular text-on-surface truncate">{p.name}</h4>
                        <span className="text-label-caps font-label-caps text-on-surface-variant">
                          קנה ב- {ils(buyin)} · ריבאיים: {units}
                        </span>
                      </div>
                    </div>
                    <div className="text-left flex flex-col items-end">
                      <span className="text-body-sm font-body-sm text-on-surface-variant mb-1">נטו</span>
                      <span
                        className={
                          'text-data-tabular font-data-tabular ' +
                          (isWinning ? 'text-primary' : isLosing ? 'text-error' : 'text-on-surface')
                        }
                      >
                        {ils(net)}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-surface-container-highest/50 rounded-lg border border-outline-variant/20 p-3">
                      <div className="text-label-caps font-label-caps text-on-surface-variant mb-1">כניסה ראשונית</div>
                      <input
                        className="w-full bg-transparent outline-none text-data-tabular font-data-tabular text-on-surface"
                        inputMode="numeric"
                        value={buyin || ''}
                        placeholder="0"
                        onChange={(e) => persist(setBuyin(session, p.id, Number(e.target.value || 0), p.name))}
                      />
                    </div>

                    <div className="bg-surface-container-highest/50 rounded-lg border border-outline-variant/20 p-3">
                      <div className="text-label-caps font-label-caps text-on-surface-variant mb-1">מספר חזרות</div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center"
                          onClick={() => persist(addRebuyUnits(session, p.id, -1, p.name))}
                          disabled={units <= 0}
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          className="flex-1 bg-transparent outline-none text-data-tabular font-data-tabular text-on-surface text-center"
                          inputMode="numeric"
                          value={units || ''}
                          placeholder="0"
                          onChange={(e) => persist(setRebuyUnits(session, p.id, Number(e.target.value || 0), p.name))}
                        />
                        <button
                          type="button"
                          className="w-10 h-10 rounded-lg bg-surface-container border border-outline-variant/30 flex items-center justify-center"
                          onClick={() => persist(addRebuyUnits(session, p.id, 1, p.name))}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex-1 bg-surface-container-highest hover:bg-surface-variant transition-colors py-2 rounded-lg border border-outline-variant flex items-center justify-center gap-2 font-body-sm text-body-sm text-on-surface"
                      onClick={() => persist(addRebuyUnits(session, p.id, 1, p.name))}
                    >
                      +{ils(REBUY_UNIT_ILS)}
                    </button>
                    <button
                      type="button"
                      className="flex-1 bg-surface-container-highest hover:bg-surface-variant transition-colors py-2 rounded-lg border border-outline-variant flex items-center justify-center gap-2 font-body-sm text-body-sm text-on-surface"
                      onClick={() => persist(addRebuyUnits(session, p.id, 2, p.name))}
                    >
                      +{ils(REBUY_UNIT_ILS * 2)}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Floating Action Button */}
      <div className="fixed bottom-[100px] left-1/2 -translate-x-1/2 z-40 w-full max-w-[300px] px-4">
        <button
          type="button"
          className="w-full h-touch-target bg-[#2D6A4F] text-white rounded-full flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] border border-[#D4AF37]/30 hover:bg-[#1B4332] active:scale-95 transition-all"
          onClick={() => nav(`/session/${session.id}/cashout`)}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="text-body-lg font-body-lg font-bold">מעבר ליציאות</span>
        </button>
      </div>
    </>
  )
}

function cnAvatar(idx: number) {
  return (
    'relative w-12 h-12 rounded-full overflow-hidden border ' +
    (idx === 0 ? 'border-2 border-tertiary' : 'border-outline-variant/50') +
    ' bg-surface-container-high flex items-center justify-center'
  )
}
