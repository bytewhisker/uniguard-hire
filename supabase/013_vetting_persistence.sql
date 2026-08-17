-- ============================================================================
-- 013 — vetting protocol persistence + activity logs
-- ============================================================================

-- Vetting check statuses live on the applications row (jsonb) so approvals
-- survive refresh / reopen and sync live between devices.
alter table public.applications
  add column if not exists vetting_data jsonb default '[]'::jsonb;

-- Admin audit trail — every stage/check/interview action, persisted
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

do $$
begin
  alter publication supabase_realtime add table public.activity_logs;
exception when duplicate_object then
  null;
end $$;