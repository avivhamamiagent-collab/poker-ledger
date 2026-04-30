import './index.css'

const APP_BUILD = '2026-04-30-ui-refresh-1'
const BUILD_KEY = 'poker-ledger.app-build'
const LEGACY_LOCAL_PREFIX = 'poker-ledger.local.'
const LEGACY_ONBOARDING_KEY = 'poker-ledger.onboarding.v1'

async function clearLegacyAppDataOnce() {
  try {
    const prev = window.localStorage.getItem(BUILD_KEY)
    if (prev === APP_BUILD) return

    // Update marker first to avoid reload loops if cleanup partially fails.
    window.localStorage.setItem(BUILD_KEY, APP_BUILD)

    // Remove legacy localStorage keys that can keep stale UX/data states.
    const toRemove: string[] = []
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const key = window.localStorage.key(i)
      if (!key) continue
      if (key.startsWith(LEGACY_LOCAL_PREFIX) || key === LEGACY_ONBOARDING_KEY) {
        toRemove.push(key)
      }
    }
    toRemove.forEach((key) => window.localStorage.removeItem(key))

    // Clear IndexedDB app DB once between incompatible builds.
    if ('indexedDB' in window) {
      await new Promise<void>((resolve) => {
        const req = window.indexedDB.deleteDatabase('poker-ledger')
        req.onsuccess = () => resolve()
        req.onerror = () => resolve()
        req.onblocked = () => resolve()
      })
    }
  } catch {
    // ignore
  }
}

async function clearStaleBrowserState() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map((reg) => reg.unregister()))
    }
  } catch {
    // ignore
  }

  try {
    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map((key) => caches.delete(key)))
    }
  } catch {
    // ignore
  }
}

void Promise.all([clearLegacyAppDataOnce(), clearStaleBrowserState()])

const rootEl = document.getElementById('root')
if (rootEl && !rootEl.hasChildNodes()) {
  rootEl.innerHTML = `
    <div style="min-height:100dvh;display:flex;align-items:center;justify-content:center;background:#070b12;color:#e7eefc;font-family:system-ui,sans-serif;padding:24px;text-align:center">
      <div style="max-width:420px">
        <div style="font-size:22px;font-weight:700;margin-bottom:8px">Poker Ledger</div>
        <div style="opacity:.8;font-size:14px">Loading…</div>
      </div>
    </div>
  `
}

async function bootstrap() {
  const { StrictMode } = await import('react')
  const { createRoot } = await import('react-dom/client')
  const { BrowserRouter } = await import('react-router-dom')
  const { App } = await import('./app/App')

  const el = document.getElementById('root')
  if (!el) throw new Error('Missing root element')

  createRoot(el).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )

  window.setTimeout(() => {
    const root = document.getElementById('root')
    if (root && !root.textContent?.trim()) {
      root.innerHTML = `
        <div style="min-height:100dvh;display:flex;align-items:center;justify-content:center;background:#070b12;color:#e7eefc;font-family:system-ui,sans-serif;padding:24px;text-align:center">
          <div style="max-width:620px">
            <div style="font-size:22px;font-weight:700;margin-bottom:8px">Poker Ledger is still initializing</div>
            <div style="font-size:14px;opacity:.85;line-height:1.5">If this stays blank, the app is hanging before first paint.</div>
          </div>
        </div>
      `
    }
  }, 2500)
}

bootstrap().catch((err) => {
  const el = document.getElementById('root')
  if (el) {
    el.innerHTML = `
      <div style="min-height:100dvh;display:flex;align-items:center;justify-content:center;background:#070b12;color:#e7eefc;font-family:system-ui,sans-serif;padding:24px;text-align:center">
        <div style="max-width:620px">
          <div style="font-size:22px;font-weight:700;margin-bottom:8px">Poker Ledger failed to start</div>
          <pre style="white-space:pre-wrap;text-align:left;font-size:12px;opacity:.85;line-height:1.5">${String(err?.stack || err)}</pre>
        </div>
      </div>
    `
  }
})

// Temporarily disable SW registration while stabilizing first paint.
// It can be re-enabled after the blank-screen path is fully resolved.
