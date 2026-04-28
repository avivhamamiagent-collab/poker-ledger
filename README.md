# Poker Ledger

Production-ready, mobile-first web app for tracking a poker night ledger (ILS).

- **UI:** Tailwind + shadcn-style components (Radix primitives)
- **Routing:** React Router
- **Storage:** Local IndexedDB (default) behind an interface; optional Supabase (auth + multi-user groups)

## Features
- Sessions (ledger per poker night)
- Players: name + optional phone
- Entries: buy-in + rebuys (rebuy unit = 50₪)
  - Quick add: +50 / +100 / +200
  - Or set rebuy units directly
- Cashouts per player
- Validation: checks `sum(cashouts)` vs `sum(buyins)` and shows delta (override possible)
- Net per player: `cashout - total_buyins`
- Settlement: greedy debtor/creditor matching → minimized number of transfers
- Payments UX per transfer:
  - Copy-to-clipboard request template
  - “Open Bit” button (generic)
- Local persistence in IndexedDB
- Export/share summary text
- Audit log (append-only)

## Local dev

```bash
cd poker-ledger
npm install
npm run dev
```

### Environment

Create `.env.local`:

```bash
# Storage
VITE_STORAGE=local              # local | supabase

# Supabase (required when VITE_STORAGE=supabase)
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ENABLE_SUPABASE_AUTH=true

# Web Push (optional; enables PushManager subscribe)
VITE_WEB_PUSH_PUBLIC_KEY=...    # VAPID public key (Base64URL)
```

## Tests

```bash
npm test
```

Settlement unit tests are in `src/domain/settlement.test.ts`.

## Deploy (Vercel)

1. Push this repo to GitHub.
2. Import into Vercel.
3. Build command: `npm run build`
4. Output: `dist`
5. Add env vars from the Environment section.

## Supabase

- SQL + RLS: `supabase/schema.sql`
- Edge Functions: `supabase/functions/*`
- Setup guide (including required secrets): `supabase/README.md`

## Notes
- Local-first remains the default.
- PWA: web manifest + minimal service worker cache in `public/sw.js`.

