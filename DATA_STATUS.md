# Data Storage Status - Poker Ledger

## Current Reality (2026-04-29)

### Auth ✅ SUPABASE
- Email + password login
- Persistent sessions
- Users stored in Supabase `auth.users`

### Data ❌ LOCAL STORAGE (browser-only)
The app STILL stores ALL game data in `localStorage`:
- Players, sessions, games, groups
- Each browser/device has its own separate data
- No cloud sync whatsoever

**The warning in the live console confirms:**
```
[store] Supabase storage requested but not bundled; using local store.
```

### What Exists But Is Not Connected
- `src/data/supabase/store.ts` - Supabase store implementation (NOT wired up)
- `src/data/store.ts` - always returns `localStore`, ignores Supabase

## What Needs to Be Built

To move data to Supabase cloud:

1. **Create tables** in Supabase: `players`, `sessions`, `groups`, `games`, etc.
2. **Wire `src/data/store.ts`** to return `supabaseStore` instead of `localStore`
3. **Add `userId` column** to all tables for RLS (row-level security)
4. **Configure RLS policies** so users only see their own data

## Questions Before I Build

1. Do you want **multi-user** (each player sees all their groups across devices) or **single-user** (just backup to cloud)?
2. Should group members see each other's games, or only their own?

---

**Bottom line:** Right now your data is in your browser's localStorage only. Supabase Auth is connected, but the game data is not. I need to know the multi-user model before I build the cloud storage.
