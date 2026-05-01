-- Poker Ledger — RLS recursion fix + missing policies + profiles + triggers
-- Date: 2026-05-01

-- =========================
-- 1) Helper: SECURITY DEFINER membership check
--    Breaks the group_members self-reference recursion in RLS.
-- =========================
create or replace function public.is_group_member(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id
      and user_id  = p_user_id
  );
$$;

create or replace function public.is_group_owner(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.group_members
    where group_id = p_group_id
      and user_id  = p_user_id
      and role     = 'owner'
  );
$$;

revoke all on function public.is_group_member(uuid, uuid) from public;
revoke all on function public.is_group_owner(uuid, uuid)  from public;
grant execute on function public.is_group_member(uuid, uuid) to authenticated, anon;
grant execute on function public.is_group_owner(uuid, uuid)  to authenticated, anon;

-- =========================
-- 2) Drop and recreate offending policies
-- =========================

-- group_members: any user can see only their own membership row (no recursion)
drop policy if exists "group_members_select_member" on public.group_members;
drop policy if exists "group_members_insert_owner" on public.group_members;
drop policy if exists "group_members_delete_owner" on public.group_members;

create policy "group_members_select_self" on public.group_members
  for select using (user_id = auth.uid());

-- Members can also see other members of their groups (via SECURITY DEFINER helper)
create policy "group_members_select_in_my_groups" on public.group_members
  for select using (public.is_group_member(group_id, auth.uid()));

create policy "group_members_insert_owner" on public.group_members
  for insert with check (public.is_group_owner(group_id, auth.uid()));

create policy "group_members_self_insert_on_accept" on public.group_members
  for insert with check (user_id = auth.uid());

create policy "group_members_update_owner" on public.group_members
  for update using (public.is_group_owner(group_id, auth.uid()))
  with check (public.is_group_owner(group_id, auth.uid()));

create policy "group_members_delete_owner" on public.group_members
  for delete using (public.is_group_owner(group_id, auth.uid()));

create policy "group_members_self_leave" on public.group_members
  for delete using (user_id = auth.uid() and role <> 'owner');

-- groups: members see; owners update; only owner can delete
drop policy if exists "groups_select_member" on public.groups;
drop policy if exists "groups_update_owner"  on public.groups;

create policy "groups_select_member" on public.groups
  for select using (public.is_group_member(id, auth.uid()));

create policy "groups_update_owner" on public.groups
  for update using (public.is_group_owner(id, auth.uid()))
  with check (public.is_group_owner(id, auth.uid()));

create policy "groups_delete_owner" on public.groups
  for delete using (public.is_group_owner(id, auth.uid()));

-- group_invites: members of group OR invited email can read; members insert; invited update; member delete
drop policy if exists "group_invites_select_member_or_email" on public.group_invites;
drop policy if exists "group_invites_insert_member"          on public.group_invites;
drop policy if exists "group_invites_update_invited"         on public.group_invites;

create policy "group_invites_select_member_or_email" on public.group_invites
  for select using (
    public.is_group_member(group_id, auth.uid())
    or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  );

create policy "group_invites_insert_member" on public.group_invites
  for insert with check (public.is_group_member(group_id, auth.uid()));

create policy "group_invites_update_invited" on public.group_invites
  for update using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  with check (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create policy "group_invites_delete_member" on public.group_invites
  for delete using (public.is_group_member(group_id, auth.uid()));

-- games: members of group can CRUD
drop policy if exists "games_select_member" on public.games;
drop policy if exists "games_insert_member" on public.games;
drop policy if exists "games_update_member" on public.games;
drop policy if exists "games_delete_member" on public.games;

create policy "games_select_member" on public.games
  for select using (public.is_group_member(group_id, auth.uid()));
create policy "games_insert_member" on public.games
  for insert with check (public.is_group_member(group_id, auth.uid()));
create policy "games_update_member" on public.games
  for update using (public.is_group_member(group_id, auth.uid()))
  with check (public.is_group_member(group_id, auth.uid()));
create policy "games_delete_member" on public.games
  for delete using (public.is_group_member(group_id, auth.uid()));

-- game_rsvps: members of host group see; user manages own
drop policy if exists "game_rsvps_select_member" on public.game_rsvps;
drop policy if exists "game_rsvps_insert_self"   on public.game_rsvps;
drop policy if exists "game_rsvps_update_self"   on public.game_rsvps;

create policy "game_rsvps_select_member" on public.game_rsvps
  for select using (
    exists (
      select 1 from public.games g
      where g.id = game_id
        and public.is_group_member(g.group_id, auth.uid())
    )
  );
create policy "game_rsvps_insert_self" on public.game_rsvps
  for insert with check (user_id = auth.uid());
create policy "game_rsvps_update_self" on public.game_rsvps
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "game_rsvps_delete_self" on public.game_rsvps
  for delete using (user_id = auth.uid());

-- game_participants
drop policy if exists "game_participants_select_member" on public.game_participants;
drop policy if exists "game_participants_insert_host"   on public.game_participants;
drop policy if exists "game_participants_delete_host"   on public.game_participants;

create policy "game_participants_select_member" on public.game_participants
  for select using (
    exists (
      select 1 from public.games g
      where g.id = game_id
        and public.is_group_member(g.group_id, auth.uid())
    )
  );
create policy "game_participants_insert_host" on public.game_participants
  for insert with check (
    exists (select 1 from public.games g where g.id = game_id and g.host_user_id = auth.uid())
  );
create policy "game_participants_update_host" on public.game_participants
  for update using (
    exists (select 1 from public.games g where g.id = game_id and g.host_user_id = auth.uid())
  ) with check (
    exists (select 1 from public.games g where g.id = game_id and g.host_user_id = auth.uid())
  );
create policy "game_participants_delete_host" on public.game_participants
  for delete using (
    exists (select 1 from public.games g where g.id = game_id and g.host_user_id = auth.uid())
  );

-- notifications: explicit insert-self policy (edge functions use service role anyway)
drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own" on public.notifications
  for insert with check (user_id = auth.uid());

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications
  for delete using (user_id = auth.uid());

-- =========================
-- 3) Profiles table + auto-create on signup
-- =========================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url   text,
  email        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_member_overlap" on public.profiles;
drop policy if exists "profiles_select_self_or_group_overlap" on public.profiles;
drop policy if exists "profiles_select_self" on public.profiles;
drop policy if exists "profiles_update_self" on public.profiles;
drop policy if exists "profiles_insert_self" on public.profiles;

create policy "profiles_select_self_or_group_overlap" on public.profiles
  for select using (
    id = auth.uid()
    or exists (
      select 1
      from public.group_members me
      join public.group_members other on other.group_id = me.group_id
      where me.user_id = auth.uid()
        and other.user_id = profiles.id
    )
  );

create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());

create policy "profiles_update_self" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- Trigger: create profile row when a new auth.users row is inserted
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================
-- 4) Generic updated_at trigger
-- =========================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  for t in select unnest(array['players','sessions','groups','games','push_subscriptions','profiles'])
  loop
    execute format('drop trigger if exists trg_set_updated_at on public.%I', t);
    execute format(
      'create trigger trg_set_updated_at before update on public.%I
       for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end$$;

-- =========================
-- 5) Missing indexes
-- =========================
create index if not exists group_members_user_id_idx           on public.group_members(user_id);
create index if not exists group_members_group_user_idx        on public.group_members(group_id, user_id);
create index if not exists group_invites_email_lower_idx       on public.group_invites(lower(email));
create index if not exists game_rsvps_user_id_idx              on public.game_rsvps(user_id);
create index if not exists notifications_user_unread_idx       on public.notifications(user_id) where read_at is null;

-- =========================
-- 6) Backfill profiles for any existing users
-- =========================
insert into public.profiles (id, email, display_name)
select u.id,
       u.email,
       coalesce(u.raw_user_meta_data ->> 'display_name', split_part(u.email, '@', 1))
from auth.users u
on conflict (id) do nothing;
