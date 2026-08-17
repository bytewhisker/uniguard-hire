-- ============================================================================
-- 012 — employees + settings persistence, interview notes/rating columns
-- ============================================================================

-- Interview assessment fields (stored on the interviews row so a refresh
-- never loses the Pass/Fail decision)
alter table public.interviews
  add column if not exists notes text,
  add column if not exists rating integer;

-- Employees roster — created when an applicant is hired
create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid references public.applications(id) on delete set null,
  employee_id text not null unique,
  full_name text not null default '',
  email text not null default '',
  phone text not null default '',
  role_title text not null default '',
  sia_licence_no text not null default '',
  sia_licence_sector text not null default '',
  sia_licence_expiry text not null default '',
  hired_date text not null default '',
  assigned_site text not null default '',
  hourly_rate numeric not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

alter table public.employees enable row level security;

drop policy if exists "employees admin all" on public.employees;
create policy "employees admin all"
  on public.employees for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Company settings (single row, id = 1)
create table if not exists public.settings (
  id integer primary key default 1 check (id = 1),
  company_name text not null default 'Uniguard Security Services UK Ltd',
  company_number text not null default '',
  sia_acs_approved boolean not null default true,
  updated_at timestamptz not null default now()
);

insert into public.settings (id) values (1) on conflict (id) do nothing;

alter table public.settings enable row level security;

drop policy if exists "settings admin all" on public.settings;
create policy "settings admin all"
  on public.settings for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Realtime
do $$
begin
  alter publication supabase_realtime add table public.employees;
  alter publication supabase_realtime add table public.settings;
exception when duplicate_object then
  null;
end $$;

-- One employee per applicant — the DB-level backstop against double hiring
create unique index if not exists employees_one_per_applicant
  on public.employees (applicant_id)
  where applicant_id is not null;