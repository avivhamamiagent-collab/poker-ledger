export function SplashScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#070b12] px-6 text-center text-zinc-50">
      <div className="space-y-5">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-cyan-300/30 bg-white/5 shadow-[0_0_80px_rgba(56,189,248,0.18)] backdrop-blur">
          <div className="chip-spin relative flex h-18 w-18 items-center justify-center rounded-full border border-amber-300/70 bg-[radial-gradient(circle_at_30%_30%,#fff3c4_0%,#d4a017_42%,#8f5f00_100%)] text-xs font-black tracking-[0.35em] text-[#241500] shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_14px_30px_rgba(0,0,0,0.35)]">
            <span className="absolute inset-1 rounded-full border border-white/35" />
            <span className="absolute inset-4 rounded-full border border-white/25" />
            <span className="relative z-10">CHIP</span>
          </div>
        </div>
        <div>
          <div className="text-xl font-semibold tracking-tight">Poker Ledger</div>
          <div className="mt-1 text-sm text-zinc-300">טוען את השולחן…</div>
          <div className="mt-4 h-1.5 w-48 overflow-hidden rounded-full bg-white/10">
            <div className="loading-bar h-full w-1/2 rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-amber-300" />
          </div>
        </div>
      </div>
    </div>
  )
}
