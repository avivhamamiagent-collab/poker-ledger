export type OnboardingStep = 'create' | 'participants' | 'entries' | 'cashout' | 'settlement' | 'done'

export type OnboardingState = {
  done: boolean
  step: OnboardingStep
  activeSessionId?: string
  startedAt?: number
}

const KEY = 'pokerLedger:onboarding:v1'

export function loadOnboarding(): OnboardingState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { done: false, step: 'create' }
    const v = JSON.parse(raw) as Partial<OnboardingState>
    return {
      done: Boolean(v.done),
      step: (v.step as OnboardingStep) || 'create',
      activeSessionId: v.activeSessionId,
      startedAt: v.startedAt,
    }
  } catch {
    return { done: false, step: 'create' }
  }
}

export function saveOnboarding(next: OnboardingState) {
  localStorage.setItem(KEY, JSON.stringify(next))
}

export function resetOnboarding() {
  localStorage.removeItem(KEY)
}
