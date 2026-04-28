# Supabase integration (Auth + Groups + Push)

This app is **local-first** by default (IndexedDB). Set `VITE_STORAGE=supabase` to enable Supabase end-to-end.

## 1) Database schema (SQL + RLS)

Run `schema.sql` in Supabase SQL editor.

Tables include:
- `players`, `sessions`, `session_participants`, `ledger_entries`, `audit_events`
- `groups`, `group_members`, `group_invites`
- `games`, `game_rsvps`, `game_participants`
- `notifications`, `push_subscriptions`

## 2) Supabase Auth

Enable **Email** provider (magic link).

The app uses `signInWithOtp` and relies on the redirect back to your site.

## 3) Edge Functions

Functions are in `supabase/functions/*`:
- `create-group`
- `invite-member`
- `respond-invite`
- `create-game`
- `set-rsvp`
- `set-participants`
- `push-send` (utility)

Deploy (CLI example):

```bash
supabase functions deploy create-group
supabase functions deploy invite-member
supabase functions deploy respond-invite
supabase functions deploy create-game
supabase functions deploy set-rsvp
supabase functions deploy set-participants
supabase functions deploy push-send
```

## 4) Edge Function secrets

Set these secrets for functions:

```bash
# Supabase
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# Web Push (VAPID)
VAPID_PUBLIC_KEY=...   # Base64URL
VAPID_PRIVATE_KEY=...  # Base64URL
VAPID_SUBJECT=mailto:you@example.com
```

## 5) Frontend env vars (Vercel)

```bash
VITE_STORAGE=supabase
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_ENABLE_SUPABASE_AUTH=true

# Optional (enables PushManager subscribe)
VITE_WEB_PUSH_PUBLIC_KEY=...
```

## Push notification limitations

- Push requires HTTPS + Service Worker support.
- iOS/Safari push support depends on iOS version and usually requires “Add to Home Screen”.
- When push is unavailable, the app still creates **in-app notifications** in `notifications`.


