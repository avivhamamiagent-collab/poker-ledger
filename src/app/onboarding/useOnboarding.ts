import * as React from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'

import { loadOnboarding, saveOnboarding, type OnboardingState, type OnboardingStep } from './onboarding-state'
import type { Session } from '../../domain/types'
import { delta } from '../../domain/session'

export function useOnboarding(session?: Session | null) {
  const location = useLocation()
  const [params] = useSearchParams()
  const [state, setState] = React.useState<OnboardingState>(() => loadOnboarding())

  const obParam = params.get('ob')
  const obActive = obParam === '1' || (!state.done && Boolean(state.activeSessionId))

  function update(next: OnboardingState) {
    setState(next)
    saveOnboarding(next)
  }

  function start(sessionId: string) {
    update({ done: false, step: 'participants', activeSessionId: sessionId, startedAt: Date.now() })
  }

  const setStep = React.useCallback((step: OnboardingStep) => {
    setState((prev) => {
      const next = { ...prev, step }
      saveOnboarding(next)
      return next
    })
  }, [])

  function complete() {
    update({ done: true, step: 'done' })
  }

  // Derive step from actual session data when we're in the onboarding session
  React.useEffect(() => {
    if (!obActive) return
    if (!session) return
    if (!state.activeSessionId || state.activeSessionId !== session.id) return

    const participantsOk = (session.participantIds?.length || 0) >= 2
    const entriesOk =
      Object.values(session.buyins || {}).some((v) => v > 0) || Object.values(session.rebuyUnits || {}).some((v) => v > 0)
    const cashoutOk = Object.values(session.cashouts || {}).some((v) => v > 0)
    const settlementOk = Math.abs(delta(session)) < 0.0001

    const isSessionRoute = location.pathname.startsWith(`/session/${session.id}`) || location.pathname.startsWith(`/sessions/${session.id}`)

    // Only advance, never go backwards automatically
    if (!isSessionRoute) return
    if (state.step === 'participants' && participantsOk) setStep('entries')
    if (state.step === 'entries' && entriesOk) setStep('cashout')
    if (state.step === 'cashout' && cashoutOk) setStep('settlement')
    if (state.step === 'settlement' && settlementOk) setStep('done')
  }, [location.pathname, obActive, session, state.activeSessionId, state.step, setStep])

  return { state, obActive, start, setStep, complete }
}
