import * as React from 'react'

type BIPEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function useInstallPrompt() {
  const [evt, setEvt] = React.useState<BIPEvent | null>(null)

  React.useEffect(() => {
    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setEvt(e as BIPEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  async function prompt() {
    if (!evt) return { outcome: 'dismissed' as const }
    await evt.prompt()
    const res = await evt.userChoice
    setEvt(null)
    return res
  }

  return { canInstall: Boolean(evt), prompt }
}
