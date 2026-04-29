import './index.css'

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
