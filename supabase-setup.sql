-- Run the whole script in Supabase Dashboard > SQL Editor.
-- This starter deliberately stores no name/email with each confession.
create extension if not exists pgcrypto;

create table if not exists public.confessions (
  id uuid primary key default gen_random_uuid(),
  message text not null check (char_length(trim(message)) between 3 and 1000),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.confessions enable row level security;
alter table public.admin_users enable row level security;

-- Remove old policies with these names if re-running the script.
drop policy if exists "Public can read approved confessions" on public.confessions;
drop policy if exists "Admins can read all confessions" on public.confessions;
drop policy if exists "Anyone can submit pending confessions" on public.confessions;
drop policy if exists "Admins can update confessions" on public.confessions;
drop policy if exists "Admins can read own admin row" on public.admin_users;

-- Anyone can see approved posts only.
create policy "Public can read approved confessions"
on public.confessions for select to anon, authenticated
using (status = 'approved');

-- Allowlisted moderators can see pending/rejected posts too.
create policy "Admins can read all confessions"
on public.confessions for select to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

-- Anyone may submit a pending post; clients cannot insert it as approved.
create policy "Anyone can submit pending confessions"
on public.confessions for insert to anon, authenticated
with check (status = 'pending' and char_length(trim(message)) between 3 and 1000);

-- Only allowlisted moderators can update status/message.
create policy "Admins can update confessions"
on public.confessions for update to authenticated
using (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())))
with check (exists (select 1 from public.admin_users a where a.user_id = (select auth.uid())));

-- Admins can check only their own allowlist row. No public insert/update/delete policies exist.
create policy "Admins can read own admin row"
on public.admin_users for select to authenticated
using (user_id = (select auth.uid()));

-- Explicitly ensure browser roles cannot delete confessions or change admin allowlist.
revoke delete on public.confessions from anon, authenticated;
revoke insert, update, delete on public.admin_users from anon, authenticated;
grant select, insert, update on public.confessions to anon, authenticated;
grant select on public.admin_users to authenticated;
