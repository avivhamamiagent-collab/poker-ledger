# Poker Ledger — Premium UI Inspiration (RTL Hebrew, React + Tailwind)

Goal: make the app feel **casino-premium** (felt table, gold accents, tactile micro-interactions) while staying **fintech-clear** for numbers.

**Core palette (given):**
- Felt/deep forest: `#041710`, `#081C15`, `#1B4332`
- Gold: `#E9C349`, `#D4AF37`
- Font: **Inter**
- RTL Hebrew + Material Symbols

---

## 0) Design-system setup (so “premium” is consistent)

### Semantic surface tokens (recommended)
Use *surfaces* instead of random hexes.

```css
:root {
  --bg: #041710;
  --surface-1: #071b13; /* card */
  --surface-2: #0b241a; /* raised */
  --stroke: rgba(233, 195, 73, 0.18);
  --text: rgba(255,255,255,0.92);
  --muted: rgba(255,255,255,0.64);
  --gold: #E9C349;
  --gold-2: #D4AF37;
}
```

### Tailwind helpers (copy/paste)
```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        felt: {
          950: '#041710',
          900: '#081C15',
          800: '#1B4332',
        },
        gold: {
          500: '#E9C349',
          600: '#D4AF37',
        }
      },
      boxShadow: {
        felt: '0 10px 30px rgba(0,0,0,.45)',
        insetFelt: 'inset 0 1px 0 rgba(255,255,255,.06), inset 0 -12px 24px rgba(0,0,0,.35)',
        glowGold: '0 0 0 1px rgba(233,195,73,.25), 0 10px 25px rgba(233,195,73,.08)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        chipBounce: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '35%': { transform: 'translateY(-10px) scale(1.02)' },
          '70%': { transform: 'translateY(0) scale(0.99)' },
          '100%': { transform: 'translateY(-2px) scale(1)' },
        },
        cardSlideIn: {
          '0%': { transform: 'translateX(24px) rotate(2deg)', opacity: '0' },
          '100%': { transform: 'translateX(0) rotate(0deg)', opacity: '1' },
        },
        flip: {
          '0%': { transform: 'rotateY(0deg)' },
          '100%': { transform: 'rotateY(180deg)' },
        },
        numberPop: {
          '0%': { transform: 'translateY(6px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        goldPulse: {
          '0%,100%': { boxShadow: '0 0 0 1px rgba(233,195,73,.18), 0 12px 25px rgba(233,195,73,.08)' },
          '50%': { boxShadow: '0 0 0 1px rgba(233,195,73,.32), 0 16px 35px rgba(233,195,73,.14)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.6s linear infinite',
        chipBounce: 'chipBounce 520ms cubic-bezier(.2,.9,.2,1) both',
        cardSlideIn: 'cardSlideIn 220ms ease-out both',
        flip: 'flip 520ms cubic-bezier(.2,.8,.2,1) both',
        numberPop: 'numberPop 180ms ease-out both',
        goldPulse: 'goldPulse 1.8s ease-in-out infinite',
      }
    }
  }
}
```

---

## 1) 12 premium UI patterns (with implementation notes)

### Pattern 1 — “Felt” cards: subtle texture + inset depth
**Why it feels premium:** casino tables are tactile; the UI should feel like *material*.

**Implementation (Tailwind):**
```tsx
<div className="rounded-2xl bg-felt-900/80 shadow-felt ring-1 ring-gold-500/15 backdrop-blur-sm">
  <div className="rounded-2xl p-4 shadow-insetFelt">
    {children}
  </div>
</div>
```
Add a faint noise overlay (SVG or PNG) as `background-image` on `body` or main surfaces (opacity 3–6%).

---

### Pattern 2 — Gold gradient border (premium bezel)
**Why:** “metal” framing is a shortcut to luxury.

```tsx
<div className="relative rounded-2xl p-[1px] bg-gradient-to-l from-gold-500/35 via-gold-600/15 to-gold-500/35">
  <div className="rounded-2xl bg-felt-950/70 p-4">
    ...
  </div>
</div>
```
Tip: Use **1px** borders; thicker starts looking gaudy fast.

---

### Pattern 3 — Animated “gold shimmer” on key CTAs (sparingly)
**Use only** on primary action (Add Session / Settle / Save). Too much = casino spam.

```tsx
<button className="relative overflow-hidden rounded-xl bg-gradient-to-l from-gold-600 to-gold-500 px-4 py-3 text-black font-semibold shadow-glowGold">
  <span className="relative z-10">שמור</span>
  <span
    aria-hidden
    className="absolute inset-0 opacity-40 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.55),transparent)] bg-[length:200%_100%] animate-shimmer"
  />
</button>
```

---

### Pattern 4 — Fintech number typography: tabular lining + semantic color
**Why:** financial apps feel “serious” when numbers align perfectly.

- Use `font-variant-numeric: tabular-nums;`
- Keep profit/loss semantics consistent (green-ish for win, red for loss, gold for totals)

```tsx
<span className="tabular-nums tracking-tight text-white">₪ 12,450</span>
<span className="tabular-nums text-emerald-300">+₪ 850</span>
<span className="tabular-nums text-rose-300">−₪ 320</span>
```

CSS:
```css
.tabular-nums { font-variant-numeric: tabular-nums; }
```

---

### Pattern 5 — Count-up + micro “pop” on value changes
**Why:** makes stats feel alive (common in trading/fintech UIs).

- Use a count-up library (`react-countup`) or a tiny spring (`framer-motion`).
- On change: briefly animate `numberPop`.

```tsx
<span key={value} className="tabular-nums animate-numberPop">
  {value.toLocaleString('he-IL')}
</span>
```

---

### Pattern 6 — Chip stack interaction for buy-in / cash-out
**Why:** chips are the poker-native metaphor; it’s a “wow” moment *and* improves comprehension.

UI idea:
- Increment/decrement shows a small chip stack that **bounces**.
- On “Add”, chips **slide** into the session card.

```tsx
<button className="active:scale-[0.98] transition" onClick={...}>
  <span className="inline-flex items-center gap-2">
    <span className="material-symbols-outlined">add</span>
    הוסף קנייה
  </span>
  <span className="ml-3 inline-block h-6 w-6 rounded-full bg-gold-500/90 shadow-glowGold animate-chipBounce" />
</button>
```

---

### Pattern 7 — Card flip “receipt” for session details
**Why:** turns a boring detail view into a delightful interaction.

Implementation approach:
- Front: compact session summary
- Back: full breakdown + notes

```tsx
<div className="[perspective:1000px]">
  <div className="relative h-40 w-full transition-transform duration-500 [transform-style:preserve-3d] data-[flipped=true]:[transform:rotateY(180deg)]" data-flipped={flipped}>
    <div className="absolute inset-0 [backface-visibility:hidden]">...</div>
    <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">...</div>
  </div>
</div>
```

---

### Pattern 8 — Dealer button / status pill system
**Why:** poker UI uses small, high-signal tokens (dealer, blind level, table type).

Use “pills” with thin gold strokes:
```tsx
<span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs text-white/90 ring-1 ring-gold-500/20 bg-felt-900/70">
  <span className="mr-1 inline-block h-2 w-2 rounded-full bg-gold-500 shadow-glowGold" />
  קאש • 5/10
</span>
```

---

### Pattern 9 — Navigation: Bottom bar + “Add” central fab (casino + utility)
**Why:** ledger is used one-handed; poker vibes come from a strong central action.

- 3–4 tabs max: Sessions, Stats, Players, Settings
- Center FAB: “+ Session” with gold pulse

```tsx
<button className="-mt-6 h-12 w-12 rounded-2xl bg-gradient-to-l from-gold-600 to-gold-500 text-black shadow-glowGold animate-goldPulse">
  <span className="material-symbols-outlined">add</span>
</button>
```

---

### Pattern 10 — “Swing” chart styling: dark grid + gold highlights
**Why:** charts are where fintech polish shows.

Chart rules:
- Very subtle grid (`rgba(255,255,255,0.06)`)
- Highlight last point with gold dot + glow
- Tooltip glass card

Tooltip container:
```tsx
<div className="rounded-xl bg-felt-900/70 ring-1 ring-gold-500/15 backdrop-blur px-3 py-2 shadow-felt">
  ...
</div>
```

---

### Pattern 11 — Settlement “min-transfers” UX (Splitwise-style, but poker-tone)
**Best practices:**
- Show **net balances** first (who owes/owed) not raw transactions.
- Offer **1-tap suggested settlements** that minimize transfers.
- Allow **partial settle** and show remaining.
- Clear rounding policy and show where rounding went.

Suggested UI:
1) Top summary card: “You owe / You’re owed / Net”
2) List of recommended transfers (1–3 items)
3) CTA: “Mark as paid” → opens confirmation with amount and counterparty

Transfer row pattern:
```tsx
<div className="flex items-center justify-between rounded-xl bg-felt-900/60 ring-1 ring-gold-500/10 p-3">
  <div className="flex flex-col">
    <span className="text-white/90">אביב → רועי</span>
    <span className="text-white/60 text-xs">סגירה חלקית</span>
  </div>
  <div className="tabular-nums text-gold-500 font-semibold">₪ 120</div>
</div>
```

---

### Pattern 12 — “Wow” empty states: poker table layout
**Why:** empty screens are most of the early experience.

Implementable empty state:
- Felt background
- A faint oval “table” outline
- 3 chip dots + one card silhouette
- CTA in gold

```tsx
<div className="relative overflow-hidden rounded-2xl bg-felt-900/40 ring-1 ring-gold-500/10 p-6 text-center">
  <div className="mx-auto h-40 w-64 rounded-[999px] ring-1 ring-white/10" />
  <div className="mt-4 text-white/80">אין עדיין סשנים</div>
  <button className="mt-3 rounded-xl bg-gradient-to-l from-gold-600 to-gold-500 px-4 py-2 font-semibold text-black">הוסף סשן ראשון</button>
</div>
```

---

## 2) Micro-interactions checklist (high impact, low complexity)

1. **Press states everywhere**: `active:scale-[0.99]` + quick shadow change.
2. **Haptics (mobile)**: on primary actions + toggles. (Web: optional Vibration API; native wrapper: use platform haptics.)
3. **Swipe actions** on session rows: archive / duplicate / share.
4. **Optimistic save** with a subtle “chip drop” tick (small bounce dot) instead of toast spam.
5. **Inline validation**: field highlights in gold (not red) until truly invalid; keep tone premium.
6. **Animated sorting**: when changing filters (cash/tournament), list reorders with `layout` animations (Framer Motion).
7. **Skeletons**: dark shimmer skeletons for charts + list rows.

Skeleton shimmer:
```tsx
<div className="h-4 w-40 rounded bg-white/10 relative overflow-hidden">
  <div className="absolute inset-0 bg-[linear-gradient(110deg,transparent,rgba(255,255,255,.08),transparent)] bg-[length:200%_100%] animate-shimmer" />
</div>
```

---

## 3) Premium visual “recipes”

### Glassmorphism (controlled)
Only for overlays/tooltips.
```tsx
<div className="bg-felt-900/55 backdrop-blur-md ring-1 ring-white/10 rounded-2xl shadow-felt" />
```

### Metallic text effect (gold)
```tsx
<span className="bg-gradient-to-l from-gold-600 via-gold-500 to-gold-600 bg-clip-text text-transparent [text-shadow:0_0_18px_rgba(233,195,73,.12)]">
  סה"כ רווח
</span>
```

### Gradient divider line (subtle)
```tsx
<div className="h-px w-full bg-gradient-to-l from-transparent via-gold-500/25 to-transparent" />
```

---

## 4) RTL/Hebrew-specific UI gotchas (don’t lose the premium feel)

- Use logical properties where possible: `ms-*`, `me-*`, `ps-*`, `pe-*` (Tailwind supports with RTL plugin or custom utilities).
- Numbers stay LTR in RTL contexts: wrap currency/amount in `<span dir="ltr">₪ 1,234</span>` to avoid bidi glitches.
- Prefer **short labels** in Hebrew; compensate with secondary text lines rather than truncating.
- Icon direction: chevrons, arrows, “back” need mirroring in RTL.

---

## 5) “Wow moments” to consider (practical)

1. **Session saved**: chip drop animation into a stack + subtle sound toggle (off by default).
2. **Big milestone** (new best month): gold confetti shimmer confined inside a card (not full-screen).
3. **Settlement completed**: transfer rows collapse into a single “All settled” badge with a gentle gold pulse.

---

## 6) References / places to pull visual cues

- Poker bankroll tracker positioning and feature set: Poker Stack ("Gorgeous design", charts, fast logging).
- Fintech visual hierarchy / whitespace / dashboards: TubikStudio fintech collections.
- Fintech dark mode inspirations + gradients + chart focus: Design4Users fintech UI collections linking to Dribbble shots.
- Settlement mental model (pairwise balances, partial settlements, rounding): Splitwise-style requirement patterns.

(Links: see sources above; many Dribbble shots are linked inside Design4Users.)
