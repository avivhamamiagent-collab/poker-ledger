-- Poker Ledger (Supabase) — initial schema scaffold
--
-- Assumptions:
-- - Local-first app; Supabase layer is optional (feature-flagged).
-- - Auth is optional; if enabled, all rows are owned by auth.uid().
-- - Amounts are stored in ILS (integer) for simplicity.

-- Enable uuid generation
create extension if not exists "pgcrypto";

-- Players are global to a user
create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists players_user_id_idx on public.players(user_id);

-- Sessions are global to a user
create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  date_iso date not null,
  allow_delta_override boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists sessions_user_id_idx on public.sessions(user_id);
create index if not exists sessions_updated_at_idx on public.sessions(updated_at desc);

-- Participants: which players are included in a session
create table if not exists public.session_participants (
  session_id uuid not null references public.sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete restrict,
  created_at timestamptz not null default now(),
  primary key (session_id, player_id)
);

-- Ledger entries: buyins/rebuys/cashouts as immutable events
-- You can also materialize totals per player by aggregation.
create type public.ledger_entry_type as enum ('buyin', 'rebuy_units', 'cashout');

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  session_id uuid not null references public.sessions(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete restrict,
  type public.ledger_entry_type not null,
  amount_ils integer,
  rebuy_units integer,
  created_at timestamptz not null default now()
);

create index if not exists ledger_entries_session_id_idx on public.ledger_entries(session_id);
create index if not exists ledger_entries_user_id_idx on public.ledger_entries(user_id);

-- Audit events (optional): mirrors local audit
create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  session_id uuid not null references public.sessions(id) on delete cascade,
  ts timestamptz not null,
  type text not null,
  message text not null
);

create index if not exists audit_events_session_id_idx on public.audit_events(session_id);

-- Groups + games + notifications (MVP)
create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type public.group_role as enum ('owner', 'member');

create table if not exists public.group_members (
  group_id uuid not null references public.groups(id) on delete cascade,
  user_id uuid not null,
  role public.group_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create type public.group_invite_status as enum ('pending', 'accepted', 'declined');

create table if not exists public.group_invites (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  email text not null,
  invited_by uuid not null,
  status public.group_invite_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz
);

create index if not exists group_invites_email_idx on public.group_invites(email);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  title text not null default '',
  starts_at timestamptz not null,
  location text,
  host_user_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists games_group_id_idx on public.games(group_id);
create index if not exists games_starts_at_idx on public.games(starts_at asc);

create type public.game_rsvp_status as enum ('going', 'interested', 'no');

create table if not exists public.game_rsvps (
  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid not null,
  status public.game_rsvp_status not null,
  updated_at timestamptz not null default now(),
  primary key (game_id, user_id)
);

create table if not exists public.game_participants (
  game_id uuid not null references public.games(id) on delete cascade,
  user_id uuid not null,
  selected_at timestamptz not null default now(),
  selected_by uuid not null,
  primary key (game_id, user_id)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  type text not null,
  title text not null,
  body text not null,
  data jsonb,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index if not exists notifications_user_id_idx on public.notifications(user_id);
create index if not exists notifications_created_at_idx on public.notifications(created_at desc);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

-- RLS
alter table public.players enable row level security;
alter table public.sessions enable row level security;
alter table public.session_participants enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.audit_events enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_invites enable row level security;
alter table public.games enable row level security;
alter table public.game_rsvps enable row level security;
alter table public.game_participants enable row level security;
alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;

-- Policies: user_id = auth.uid()
create policy "players_select_own" on public.players for select using (user_id = auth.uid());
create policy "players_insert_own" on public.players for insert with check (user_id = auth.uid());
create policy "players_update_own" on public.players for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "players_delete_own" on public.players for delete using (user_id = auth.uid());

create policy "sessions_select_own" on public.sessions for select using (user_id = auth.uid());
create policy "sessions_insert_own" on public.sessions for insert with check (user_id = auth.uid());
create policy "sessions_update_own" on public.sessions for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "sessions_delete_own" on public.sessions for delete using (user_id = auth.uid());

-- session_participants: join through sessions
create policy "session_participants_select_own" on public.session_participants
for select using (
  exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy "session_participants_insert_own" on public.session_participants
for insert with check (
  exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy "session_participants_delete_own" on public.session_participants
for delete using (
  exists (select 1 from public.sessions s where s.id = session_id and s.user_id = auth.uid())
);

-- ledger_entries: user_id = auth.uid() AND session belongs to user
create policy "ledger_entries_select_own" on public.ledger_entries
for select using (user_id = auth.uid());
create policy "ledger_entries_insert_own" on public.ledger_entries
for insert with check (user_id = auth.uid());
create policy "ledger_entries_update_own" on public.ledger_entries
for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "ledger_entries_delete_own" on public.ledger_entries
for delete using (user_id = auth.uid());

create policy "audit_events_select_own" on public.audit_events
for select using (user_id = auth.uid());
create policy "audit_events_insert_own" on public.audit_events
for insert with check (user_id = auth.uid());

-- groups: any authenticated user can select groups they are a member of
create policy "groups_select_member" on public.groups
for select using (
  exists (select 1 from public.group_members m where m.group_id = id and m.user_id = auth.uid())
);
create policy "groups_insert_owner" on public.groups
for insert with check (created_by = auth.uid());
create policy "groups_update_owner" on public.groups
for update using (
  exists (select 1 from public.group_members m where m.group_id = id and m.user_id = auth.uid() and m.role = 'owner')
);

-- group_members
create policy "group_members_select_member" on public.group_members
for select using (
  exists (select 1 from public.group_members m where m.group_id = group_id and m.user_id = auth.uid())
);
create policy "group_members_insert_owner" on public.group_members
for insert with check (
  exists (select 1 from public.group_members m where m.group_id = group_id and m.user_id = auth.uid() and m.role = 'owner')
);
create policy "group_members_delete_owner" on public.group_members
for delete using (
  exists (select 1 from public.group_members m where m.group_id = group_id and m.user_id = auth.uid() and m.role = 'owner')
);

-- group_invites: members can see invites for their groups; invited user can see by email
create policy "group_invites_select_member_or_email" on public.group_invites
for select using (
  exists (select 1 from public.group_members m where m.group_id = group_id and m.user_id = auth.uid())
  or (lower(email) = lower(auth.jwt() ->> 'email'))
);
create policy "group_invites_insert_member" on public.group_invites
for insert with check (
  exists (select 1 from public.group_members m where m.group_id = group_id and m.user_id = auth.uid())
);
create policy "group_invites_update_invited" on public.group_invites
for update using (lower(email) = lower(auth.jwt() ->> 'email'));

-- games: any group member can view/edit
create policy "games_select_member" on public.games
for select using (
  exists (select 1 from public.group_members m where m.group_id = group_id and m.user_id = auth.uid())
);
create policy "games_insert_member" on public.games
for insert with check (
  exists (select 1 from public.group_members m where m.group_id = group_id and m.user_id = auth.uid())
);
create policy "games_update_member" on public.games
for update using (
  exists (select 1 from public.group_members m where m.group_id = group_id and m.user_id = auth.uid())
);
create policy "games_delete_member" on public.games
for delete using (
  exists (select 1 from public.group_members m where m.group_id = group_id and m.user_id = auth.uid())
);

-- game_rsvps
create policy "game_rsvps_select_member" on public.game_rsvps
for select using (
  exists (
    select 1 from public.games g
    join public.group_members m on m.group_id = g.group_id
    where g.id = game_id and m.user_id = auth.uid()
  )
);
create policy "game_rsvps_insert_self" on public.game_rsvps
for insert with check (user_id = auth.uid());
create policy "game_rsvps_update_self" on public.game_rsvps
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- game_participants: group member can view; host can set
create policy "game_participants_select_member" on public.game_participants
for select using (
  exists (
    select 1 from public.games g
    join public.group_members m on m.group_id = g.group_id
    where g.id = game_id and m.user_id = auth.uid()
  )
);
create policy "game_participants_insert_host" on public.game_participants
for insert with check (
  exists (select 1 from public.games g where g.id = game_id and g.host_user_id = auth.uid())
);
create policy "game_participants_delete_host" on public.game_participants
for delete using (
  exists (select 1 from public.games g where g.id = game_id and g.host_user_id = auth.uid())
);

-- notifications
create policy "notifications_select_own" on public.notifications
for select using (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications
for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- push_subscriptions
create policy "push_subscriptions_select_own" on public.push_subscriptions
for select using (user_id = auth.uid());
create policy "push_subscriptions_upsert_own" on public.push_subscriptions
for insert with check (user_id = auth.uid());
create policy "push_subscriptions_update_own" on public.push_subscriptions
for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "push_subscriptions_delete_own" on public.push_subscriptions
for delete using (user_id = auth.uid());

