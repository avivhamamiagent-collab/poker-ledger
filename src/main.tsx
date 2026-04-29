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

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // ignore
    })
  })
}
