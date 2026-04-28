# Supabase integration (scaffold)

This app is **local-first** by default (IndexedDB). Supabase support is planned behind an env toggle.

## Files

- `schema.sql` — initial schema scaffold (players, sessions, participants, ledger_entries, audit_events) + RLS notes.

## Environment variables

Add these in Vercel (or `.env.local`):

```bash
VITE_STORAGE=local              # or: supabase
VITE_SUPABASE_URL=...           # required for supabase
VITE_SUPABASE_ANON_KEY=...      # required for supabase
VITE_ENABLE_SUPABASE_AUTH=false # scaffold only
```

## Recommended approach

1. Start with **one user** (your account) — enable Supabase Auth later.
2. Keep local IndexedDB as a fallback (offline / fast).
3. Introduce a sync strategy:
   - Either event-sourcing (`ledger_entries`) or snapshot-per-session.
   - Conflict resolution: last-write-wins per field OR append-only entries.

## Notes on RLS

`schema.sql` uses `user_id = auth.uid()` policies.

If Auth is disabled but you still want to use Supabase as a backend, you can:

- temporarily disable RLS (NOT recommended for production), or
- use service-role key on a server-side API (recommended), keeping anon client locked down.

