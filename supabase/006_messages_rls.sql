-- ============================================================================
-- 006 — messages RLS: sender is server-authoritative; candidate can only
-- reach their OWN application's thread (subquery runs under the candidate's RLS)
-- ============================================================================
create or replace function public.force_message_sender()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  is_admin bool := public.is_admin();
begin
  if tg_op = 'INSERT' then
    new.sender := case when is_admin then 'admin' else 'user' end;
  elsif new.sender is distinct from old.sender then
    raise exception 'sender is managed by the server and cannot be changed';
  end if;
  if not is_admin then
    new.read_by_admin := false;      -- candidates cannot mark the admin side read
    if tg_op = 'INSERT' then
      new.read_by_user := true;      -- a candidate sending is, by definition, read by them
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists messages_force_sender on public.messages;
create trigger messages_force_sender
  before insert or update on public.messages
  for each row execute function public.force_message_sender();

alter table public.messages enable row level security;

drop policy if exists "public insert messages" on public.messages;
drop policy if exists "public read messages" on public.messages;
drop policy if exists "public update messages" on public.messages;
drop policy if exists "public delete messages" on public.messages;

drop policy if exists "messages insert own thread or admin" on public.messages;
create policy "messages insert own thread or admin"
  on public.messages for insert to authenticated
  with check (
    public.is_admin()
    or exists (
      select 1 from public.applications a
      where a.id = public.messages.application_id
        and a.user_id = auth.uid()
    )
  );

drop policy if exists "messages select own thread or admin" on public.messages;
create policy "messages select own thread or admin"
  on public.messages for select to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.applications a
      where a.id = public.messages.application_id
        and a.user_id = auth.uid()
    )
  );

drop policy if exists "messages update own thread or admin" on public.messages;
create policy "messages update own thread or admin"
  on public.messages for update to authenticated
  using (
    public.is_admin()
    or exists (
      select 1 from public.applications a
      where a.id = public.messages.application_id
        and a.user_id = auth.uid()
    )
  );

drop policy if exists "messages delete admin" on public.messages;
create policy "messages delete admin"
  on public.messages for delete to authenticated
  using (public.is_admin());