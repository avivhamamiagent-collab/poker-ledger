export function SplashScreen() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col justify-between items-center p-container-padding relative overflow-hidden">
      {/* Ambient Background Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-container rounded-full blur-[120px] opacity-40" />
      </div>

      {/* Top Spacer for centering */}
      <div className="flex-1" />

      {/* Central Content Area */}
      <main className="w-full max-w-sm flex flex-col items-center justify-center gap-section-margin z-10 relative">
        {/* 3D Poker Chip */}
        <div className="w-48 h-48 relative drop-shadow-[0_0_30px_rgba(212,175,55,0.2)]">
          <img
            alt="Premium 3D poker chip"
            className="w-full h-full object-contain filter contrast-125 saturate-110 motion-safe:animate-chipBounce"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbN1ykKctBxFMY1v7wNFVeSKE1kapfumlHipL8Xyo_YKsHudvj9BEFmyqwfZhsPxO31i3gXjwWFYoackT5emKibqM8fB0t0K7HVg2roZyfcI6WPtwiYEaUHEZHwn22HzE0sYAPXzQUjfy8-0UzO7v1CaGxiV9i_FvsLOJ1GLdYIx6DKWDVofD1yx1_X_441HIWi1DNywyKiRrsFK8-F0-xDLdEo9Urq-VvlTLhRwkd2iK8ECeYuNpwNfsLraSvVf6b8B2K2LHcFZ0"
          />
        </div>

        {/* Loading Indicator Area */}
        <div className="w-full flex flex-col items-center gap-stack-gap">
          <p className="font-headline-md text-headline-md text-tertiary">נכנסים למועדון...</p>
          {/* Sleek Loading Bar */}
          <div className="w-64 h-1.5 bg-surface-container-highest rounded-full overflow-hidden border border-outline-variant/30">
            <div className="h-full bg-gradient-to-l from-tertiary via-primary to-primary-container w-2/3 rounded-full relative overflow-hidden">
              <div className="absolute inset-0 bg-white/20 w-full h-full" />
              <div
                aria-hidden
                className="absolute inset-0 opacity-40 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.55),transparent)] bg-[length:200%_100%] motion-safe:animate-shimmer"
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Brand Anchor */}
      <div className="flex-1 flex flex-col justify-end w-full pb-section-margin z-10">
        <h1 className="font-headline-lg text-headline-lg text-tertiary-container tracking-widest text-center opacity-80 uppercase relative">
          <span className="absolute -inset-1 blur-sm bg-tertiary-container/20 rounded-lg -z-10" />
          פנקס פוקר
        </h1>
      </div>
    </div>
  )
}
