-- Migration: Create public.users table linked to auth.users
-- Automatically extracts first_name and last_name from auth.users raw_user_meta_data JSON

-- 1. Create public.users table
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  first_name text,
  last_name text,
  email text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.users enable row level security;

-- 3. RLS Policies (Idempotent)
drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
  on public.users
  for select
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
  on public.users
  for update
  using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.users;
create policy "Users can insert their own profile"
  on public.users
  for insert
  with check (auth.uid() = id);

-- 4. Auto-update updated_at timestamp trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_users_updated on public.users;
create trigger on_users_updated
  before update on public.users
  for each row
  execute function public.handle_updated_at();

-- 5. Trigger function to automatically sync new users from auth.users
create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = public
as $$
begin
  insert into public.users (id, first_name, last_name, email, created_at, updated_at)
  values (
    new.id,
    new.raw_user_meta_data->>'first_name',
    new.raw_user_meta_data->>'last_name',
    new.email,
    coalesce(new.created_at, now()),
    now()
  )
  on conflict (id) do update set
    first_name = coalesce(excluded.first_name, public.users.first_name),
    last_name = coalesce(excluded.last_name, public.users.last_name),
    email = coalesce(excluded.email, public.users.email),
    updated_at = now();

  return new;
end;
$$ language plpgsql;

-- 6. Trigger on auth.users when a user signs up
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- 7. Backfill existing registered users into public.users
insert into public.users (id, first_name, last_name, email, created_at, updated_at)
select
  id,
  raw_user_meta_data->>'first_name',
  raw_user_meta_data->>'last_name',
  email,
  created_at,
  now()
from auth.users
on conflict (id) do update set
  first_name = coalesce(excluded.first_name, public.users.first_name),
  last_name = coalesce(excluded.last_name, public.users.last_name),
  email = coalesce(excluded.email, public.users.email),
  updated_at = now();
