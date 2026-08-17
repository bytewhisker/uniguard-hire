-- ============================================================================
-- 004 — applications RLS: owner inserts/reads own; admin reads/updates all
-- ============================================================================
alter table public.applications enable row level security;

drop policy if exists "public insert applications" on public.applications;
drop policy if exists "public read applications" on public.applications;
drop policy if exists "public update applications" on public.applications;

drop policy if exists "applications insert own" on public.applications;
create policy "applications insert own"
  on public.applications for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "applications select own or admin" on public.applications;
create policy "applications select own or admin"
  on public.applications for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "applications update admin" on public.applications;
create policy "applications update admin"
  on public.applications for update to authenticated
  using (public.is_admin());