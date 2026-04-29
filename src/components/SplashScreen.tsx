export function SplashScreen() {
  return (
    <div className="felt-surface relative flex min-h-dvh items-center justify-center overflow-hidden px-6 text-center text-zinc-50">
      {/* Decorative back-cards */}
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="card-float absolute left-1/2 top-1/2 h-44 w-32 -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-2xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-sm" />
        <div className="card-float-delayed absolute left-1/2 top-1/2 h-44 w-32 -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded-2xl border border-emerald-300/10 bg-gradient-to-b from-emerald-300/10 to-white/5 shadow-[0_40px_120px_rgba(0,0,0,0.65)] backdrop-blur-sm" />
      </div>

      <div className="relative z-10 space-y-6">
        {/* Chip stack */}
        <div className="mx-auto grid place-items-center">
          <div className="relative h-28 w-28">
            <div className="poker-chip chip-stack-1 absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2" />
            <div className="poker-chip chip-stack-2 absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2" />
            <div className="poker-chip chip-stack-3 chip-spin-slow absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <div className="text-2xl font-semibold tracking-tight">
            <span className="brand-glow">Poker Ledger</span>
          </div>
          <div className="mt-1 text-sm text-zinc-300">טוען את השולחן…</div>

          <div className="mt-5 h-1.5 w-56 overflow-hidden rounded-full bg-white/10">
            <div className="loading-bar h-full w-1/2 rounded-full bg-gradient-to-r from-emerald-300 via-cyan-300 to-amber-300" />
          </div>

          <div className="mt-3 text-xs text-zinc-500">מכינים צ׳יפים, סופרים בנק…</div>
        </div>
      </div>
    </div>
  )
}
