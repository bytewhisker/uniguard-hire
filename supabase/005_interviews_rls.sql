-- ============================================================================
-- 005 — interviews RLS: admins create/update; owner or admin reads
-- ============================================================================
alter table public.interviews enable row level security;

drop policy if exists "public insert interviews" on public.interviews;
drop policy if exists "public read interviews" on public.interviews;
drop policy if exists "public update interviews" on public.interviews;

drop policy if exists "interviews insert admin" on public.interviews;
create policy "interviews insert admin"
  on public.interviews for insert to authenticated
  with check (public.is_admin());

drop policy if exists "interviews select owner or admin" on public.interviews;
create policy "interviews select owner or admin"
  on public.interviews for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.applications a
      where a.id = public.interviews.application_id
        and a.user_id = auth.uid()
    )
  );

drop policy if exists "interviews update admin" on public.interviews;
create policy "interviews update admin"
  on public.interviews for update to authenticated
  using (public.is_admin());