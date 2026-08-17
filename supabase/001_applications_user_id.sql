-- ============================================================================
-- 001 — applications: add user_id column (idempotent, no data touched)
-- ============================================================================
alter table public.applications
  add column if not exists user_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'applications_user_id_fkey'
      and conrelid = 'public.applications'::regclass
  ) then
    alter table public.applications
      add constraint applications_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete set null;
  end if;
end $$;

create index if not exists applications_user_id_idx on public.applications (user_id);