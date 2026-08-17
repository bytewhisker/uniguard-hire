-- ============================================================================
-- 009 — jobs: admin creates/edits listings; every signed-in user (candidate
-- or admin) reads them so new vacancies appear on candidate dashboards.
-- ============================================================================
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  location text not null default '',
  pay_rate numeric not null default 0,
  employment_type text not null default 'Full-Time',
  sia_required boolean not null default true,
  status text not null default 'active',
  created_date text not null default '',
  description text not null default '',
  applicants_count integer not null default 0,
  created_at timestamptz not null default now()
);

-- Non-destructive migration for existing installs: keep old data, add the new
-- column, then drop the old one (only if it exists).
do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'jobs' and column_name = 'sia_required'
  ) then
    alter table public.jobs add column sia_required boolean not null default true;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'jobs' and column_name = 'sia_requirement'
  ) then
    -- Backfill: treat any value other than 'None' as SIA-required
    update public.jobs set sia_required = case when sia_requirement = 'None' then false else true end
      where sia_requirement is not null;
    alter table public.jobs drop column sia_requirement;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'jobs' and column_name = 'department'
  ) then
    alter table public.jobs drop column department;
  end if;
end $$;

alter table public.jobs enable row level security;

drop policy if exists "jobs select all" on public.jobs;
create policy "jobs select all"
  on public.jobs for select to anon, authenticated
  using (true);

drop policy if exists "jobs insert admin" on public.jobs;
create policy "jobs insert admin"
  on public.jobs for insert to authenticated
  with check (public.is_admin());

drop policy if exists "jobs update admin" on public.jobs;
create policy "jobs update admin"
  on public.jobs for update to authenticated
  using (public.is_admin());

drop policy if exists "jobs delete admin" on public.jobs;
create policy "jobs delete admin"
  on public.jobs for delete to authenticated
  using (public.is_admin());

do $$
begin
  alter publication supabase_realtime add table public.jobs;
exception when duplicate_object then
  null;
end $$;