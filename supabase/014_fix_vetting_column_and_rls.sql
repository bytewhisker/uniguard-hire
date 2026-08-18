-- ============================================================================
-- 014 — Ensure vetting_data column exists + activity_logs realtime
--        Safe to re-run; all statements are idempotent.
-- ============================================================================

-- Add vetting_data column if it does not exist yet (from 013, but safe to repeat)
alter table public.applications
  add column if not exists vetting_data jsonb default '[]'::jsonb;

-- Ensure activity_logs table exists (safe re-run)
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  applicant_id uuid references public.applications(id) on delete cascade,
  applicant_name text not null default '',
  action text not null default '',
  "user" text not null default '',
  created_at timestamptz not null default now()
);

alter table public.activity_logs enable row level security;

drop policy if exists "activity_logs admin all" on public.activity_logs;
create policy "activity_logs admin all"
  on public.activity_logs for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Add realtime support for all tables that need it (idempotent)
do $$
begin
  alter publication supabase_realtime add table public.activity_logs;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.applications;
exception when duplicate_object then null;
end $$;
