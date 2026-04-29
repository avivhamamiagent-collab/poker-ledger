# 🃏 Poker Ledger

> אפליקציית ניהול שולחנות פוקר בעברית — ללא Excel, ללא WhatsApp, ללא כאב ראש.

Production-ready, mobile-first web app for managing private poker game finances (ILS). Built with React 19, Vite, Tailwind CSS, and optional Supabase backend.

**Live:** [poker-ledger-mocha.vercel.app](https://poker-ledger-mocha.vercel.app)

---

## 📸 What It Does

Poker Ledger replaces the messy Excel/WhatsApp workflow that most home poker games use to track buy-ins, rebuys, cashouts, and settlements. One person (the "ledger manager") creates a session, adds players, records entries and cashouts, and the app automatically calculates who owes whom — with minimized transfers.

---

## ✨ Features

### Core Game Management
- **Sessions** — Create a poker night session with date, location, and notes
- **Players & Roster** — Persistent player list with name + optional phone number
- **Entries (Buy-ins & Rebuys)** — Track each player's total investment
  - Rebuy unit: 50₪
  - Quick-add buttons: +50 / +100 / +200
  - Manual override for custom amounts
- **Cashouts** — Record how much each player walked away with
- **Validation** — Auto-checks `Σ(cashouts)` vs `Σ(buyins)` and shows delta (override possible)
- **Net per Player** — `cashout − total_buyins` for each player
- **Settlement** — Greedy debtor/creditor matching algorithm → minimized number of transfers
- **Payments UX** — For each transfer:
  - Copy-to-clipboard payment request template (Hebrew)
  - "Open Bit" button (generic deep-link)
- **Audit Log** — Append-only log of all session changes

### Groups & Multi-Session
- **Groups** — Organize sessions by group (e.g., "Thursday crew", "Work games")
- **Group Dashboard** — View all sessions within a group, aggregate stats
- **Notifications** — In-app notification center for group activity

### Data & Export
- **Export/Share** — Generate a formatted text summary of session results
- **Local-first** — IndexedDB persistence works offline, no account required
- **Optional Cloud** — Supabase backend for auth, multi-user groups, and cloud sync

### UX
- **Onboarding Flow** — Guided first-run experience
- **PWA** — Installable as an app (web manifest + service worker)
- **Mobile-first RTL** — Hebrew-first layout, optimized for phones
- **Dark Poker Theme** — Casino-inspired design with animated splash screen, glass panels, poker chip animations, and gold/neon accents

---

## 🏗 Architecture

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 + custom CSS animations |
| Components | shadcn/ui pattern (Radix primitives + CVA) |
| Icons | Lucide React |
| Routing | React Router 7 |
| State | React Context + hooks |
| Local Storage | IndexedDB via `idb` |
| Cloud Storage | Supabase (optional) |
| Auth | Supabase Auth — magic link (email OTP) |
| Push | Web Push API (VAPID, optional) |
| Testing | Vitest + Testing Library |
| Deploy | Vercel |

### Project Structure

```
src/
├── app/
│   ├── auth/           # Auth context + RequireAuth guard
│   ├── hooks/          # Data hooks (useSessions, useGroups, useRoster, etc.)
│   ├── onboarding/     # First-run onboarding flow
│   ├── pages/          # Route pages
│   │   ├── groups/     # GroupsPage, GroupPage, GamePage
│   │   └── session/    # SessionLayout, Entries, Cashouts, Settlement, Export, Audit
│   ├── push/           # Web Push subscription
│   ├── pwa/            # Install prompt hook
│   ├── roster/         # Roster context
│   ├── shell/          # AppShell (main layout after login)
│   ├── App.tsx         # Root app with providers
│   └── store-context.tsx
├── components/
│   ├── SplashScreen.tsx # Animated poker chip splash
│   └── ui/             # Button, Card, Input, Toast, Toaster
├── config/
│   └── env.ts          # Environment config (VITE_* vars)
├── data/
│   ├── local-store.ts  # IndexedDB store implementation
│   ├── store.ts        # Store interface + factory
│   └── supabase/       # Supabase client + store implementation
├── domain/
│   ├── ids.ts          # ID generation
│   ├── migrate.ts      # Schema migrations
│   ├── roster-key.ts   # Player roster key logic
│   ├── settlement.test.ts  # Settlement algorithm tests
│   └── types.ts        # Core domain types
├── lib/                # Utilities (clipboard, money formatting, clsx helpers)
├── storage/
│   ├── db.ts           # IndexedDB database definition
│   └── roster.ts       # Roster persistence
├── main.tsx            # Entry point
└── index.css           # Global styles + animations
```

### Key Pages & Routes

| Route | Page | Description |
|-------|------|-------------|
| `/login` | LoginPage | Magic link authentication (email OTP) |
| `/` | SessionsPage | List of all poker sessions |
| `/onboarding` | OnboardingPage | First-run guided setup |
| `/roster` | RosterPage | Manage player list |
| `/groups` | GroupsPage | List of groups |
| `/groups/:id` | GroupPage | Group detail + sessions |
| `/groups/:id/game` | GamePage | Active game within a group |
| `/sessions/:id` | SessionLayout | Session wrapper |
| `/sessions/:id/entries` | SessionEntriesPage | Buy-ins & rebuys |
| `/sessions/:id/cashouts` | SessionCashoutsPage | Cashout recording |
| `/sessions/:id/settlement` | SessionSettlementPage | Who owes whom |
| `/sessions/:id/export` | SessionExportPage | Share results |
| `/sessions/:id/audit` | SessionAuditPage | Change history |
| `/notifications` | NotificationsPage | In-app notifications |

### Storage Architecture

The app uses a **store interface pattern** — all data access goes through `src/data/store.ts`, which delegates to either:

1. **`local-store.ts`** — IndexedDB via `idb`. Works offline, no account needed. Default mode.
2. **`supabase/store.ts`** — Supabase backend. Enables auth, multi-user groups, cloud sync.

Selected via `VITE_STORAGE` env var.

### Domain Model

```
Session → has many Entries (buy-in events per player)
        → has many Cashouts (final amounts per player)
        → computed: Settlement (minimized transfers)

Group   → has many Sessions
Roster  → global player list (name + phone)
```

### Settlement Algorithm

Uses a greedy matching approach:
1. Calculate net for each player (`cashout − total_buyins`)
2. Separate into debtors (negative net) and creditors (positive net)
3. Greedily match largest debtor with largest creditor
4. Result: minimum number of transfers to settle all debts

---

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- npm

### Install & Run

```bash
cd poker-ledger
npm install
npm run dev
```

Opens at `http://localhost:5173`

### Environment Variables

Create `.env.local`:

```bash
# Required
VITE_STORAGE=local              # "local" (IndexedDB) or "supabase"

# Required when VITE_STORAGE=supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_ENABLE_SUPABASE_AUTH=true

# Optional — enables push notifications
VITE_WEB_PUSH_PUBLIC_KEY=       # VAPID public key (Base64URL)
```

> **Note:** The app works fully in `local` mode with no backend. Supabase is only needed for multi-user features.

---

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:ui       # Vitest UI
```

Key test files:
- `src/domain/settlement.test.ts` — Settlement algorithm
- `src/domain/selectors.test.ts` — Data selectors
- `src/domain/migrate.test.ts` — Schema migrations

---

## 🚢 Deployment (Vercel)

1. Push repo to GitHub
2. Import into Vercel
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables (see above)

The app is currently deployed at `poker-ledger-mocha.vercel.app`.

---

## 🎨 Design System

See [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) for the full design specification — color palette, typography, component styles, page layouts, and animation details.

**Theme:** Casino-inspired dark mode
- Deep black (`#070b12`) background
- Poker green (`#1a472a`) accents
- Gold (`#d4af37`) premium highlights
- Neon green (`#00ff88`) interactive accents
- RTL-first, Hebrew typography

---

## 📦 Supabase Setup

- **SQL schema + RLS policies:** `supabase/schema.sql`
- **Edge Functions:** `supabase/functions/*`
- **Setup guide:** `supabase/README.md`

---

## 📱 PWA

- **Manifest:** `public/manifest.webmanifest`
- **Service Worker:** `public/sw.js` (minimal cache strategy)
- **Install Prompt:** Handled via `useInstallPrompt` hook

---

## 📄 License

Private — Aviv Hamami. All rights reserved.
