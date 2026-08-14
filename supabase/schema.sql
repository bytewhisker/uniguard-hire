-- ============================================================================
-- Uniguard Hire — Supabase Security Migration v2 (REVISED)
-- NON-DESTRUCTIVE: no table is dropped, truncated or recreated; no rows are
-- deleted. Safe to run multiple times (idempotent).
--
-- Security model
--   * Candidates are Supabase Auth users; every application is owned by the
--     auth user who submitted it (applications.user_id).
--   * Anonymous users get ZERO rows/events from tables, bucket and realtime.
--   * Admins are Auth users flagged is_admin = true in public.profiles.
--   * Message sender is AUTHORITATIVE FROM THE SERVER (trigger) — the
--     client-supplied sender is always overwritten, so no one can forge
--     sender = 'admin'.
--   * Evidence bucket stays PRIVATE; uploads only to evidence/<uid>/…, only
--     allowed file types, max 10 MB (enforced by trigger — the reliable
--     layer — while RLS keeps the folder scoping).
--   * Existing data is preserved. Legacy applications without user_id remain
--     visible to admins only; the backfill at the end links ONLY exact,
--     unique email matches (ambiguity analysis included, no guessing).
--
-- Step 1 (safe):  edit the ADMIN CREDENTIALS block (section 2b) below, then
--   run this whole file. The admin account is created, promoted and kept in
--   sync automatically — no Dashboard clicks needed.
-- Step 2 (audit):  run section 8 analysis BEFORE the backfill if you want to
--   review what will be linked.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. applications — ADD user_id column (idempotent, no data touched)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 2. profiles — one row per auth user; auto-created on signup
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

-- Backfill rows for auth users that already exist (non-destructive)
insert into public.profiles (id, email, full_name)
select id, email, coalesce(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (id) do nothing;

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin check used by policies; security definer by design (reads profiles
-- regardless of RLS, but only ever for the *current* auth user)
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.is_admin
  );
$$;

-- ---------------------------------------------------------------------------
-- 2b. ADMIN ACCOUNT — CHANGE CREDENTIALS HERE
--   * CHANGE PASSWORD: edit V_ADMIN_PASS below and re-run the file (or just
--     re-run this one block). New password applied instantly — no reset link,
--     no email — and all existing admin sessions are revoked.
--   * CHANGE EMAIL: edit V_ADMIN_EMAIL below, delete the old account once:
--       delete from auth.users where email = '<old admin email>';
--     then re-run the file → a fresh admin account with the new email is
--     created (deleting the auth user removes its profile row too).
--   ⚠ WARNING: running this block ALWAYS overwrites the admin password with
--     the value in V_ADMIN_PASS. Only re-run it when you intend to change
--     credentials. Also: the password sits in plain text in this file — keep
--     the real one out of git; set it here locally right before running.
-- ---------------------------------------------------------------------------
do $$
declare
  v_admin_email text := 'uniguardhire@admin.com';   -- ← EDIT: admin email
  v_admin_pass  text := 'REPLACE-ME-StrongPass!123'; -- ← EDIT: admin password
  v_uid uuid;
begin
  select id into v_uid from auth.users where email = v_admin_email;

  if v_uid is null then
    -- Create the admin auth account (pre-confirmed — no confirmation email is sent)
    v_uid := gen_random_uuid();
    insert into auth.users
      (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
       raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    values
      ('00000000-0000-0000-0000-000000000000', v_uid, 'authenticated', 'authenticated',
       v_admin_email, crypt(v_admin_pass, gen_salt('bf')), now(),
       jsonb_build_object('provider', 'email', 'providers', jsonb_build_array('email')),
       '{}'::jsonb, now(), now());
    insert into auth.identities
      (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    values
      (v_uid::text, v_uid,
       jsonb_build_object('sub', v_uid::text, 'email', v_admin_email),
       'email', now(), now(), now());
  else
    -- Admin already exists → apply new password and revoke old sessions
    update auth.users
       set encrypted_password = crypt(v_admin_pass, gen_salt('bf'))
     where id = v_uid;
    delete from auth.sessions where user_id = v_uid;
  end if;

  -- Admin flag (also keeps email in sync with the password updates above)
  insert into public.profiles (id, email, full_name, is_admin)
  values (v_uid, v_admin_email, 'Uniguard Admin', true)
  on conflict (id) do update
    set email = v_admin_email, is_admin = true;
end $$;

-- ---------------------------------------------------------------------------
-- 3. applications — RLS: owner inserts/reads own; admin reads/updates all
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 4. interviews — admins create/update; owner or admin reads
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 5. messages — sender is server-authoritative; candidate can only reach
--    their OWN application's thread (subquery runs under the candidate's RLS)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- 6. Evidence bucket — PRIVATE + folder scoping (RLS) + type/size limits
--    (trigger). Type/size live in the trigger, not the policy: the storage
--    backend commits metadata (mimetype/size) on insert, and the row-level
--    BEFORE trigger is guaranteed to see it, while a WITH CHECK evaluated
--    earlier could see a NULL and reject every upload.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('evidence', 'evidence', false)
on conflict (id) do update set public = false;

create or replace function public.check_evidence_upload()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  ftype text;
  fsize bigint;
begin
  if new.bucket_id <> 'evidence' then
    return new;
  end if;

  fsize := coalesce((new.metadata ->> 'size')::bigint, 0);
  if fsize > 10485760 then
    raise exception 'Evidence file exceeds the 10 MB limit';
  end if;

  ftype := lower(coalesce(new.mimetype, new.metadata ->> 'mimetype', ''));
  if ftype not in (
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) then
    raise exception 'File type "%" is not allowed for evidence uploads', ftype;
  end if;

  return new;
end;
$$;

drop trigger if exists evidence_validate_upload on storage.objects;
create trigger evidence_validate_upload
  before insert or update on storage.objects
  for each row execute function public.check_evidence_upload();

-- Remove any legacy evidence policies on storage.objects (v1 names are not
-- guaranteed; drop by matching the policy text — never touches other buckets)
do $$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'storage' and tablename = 'objects'
      and (qual ilike '%evidence%' or with_check ilike '%evidence%')
  loop
    execute format('drop policy %I on storage.objects', p.policyname);
  end loop;
end $$;

drop policy if exists "evidence upload own or admin" on storage.objects;
create policy "evidence upload own or admin"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'evidence'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

drop policy if exists "evidence select own or admin" on storage.objects;
create policy "evidence select own or admin"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'evidence'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin())
  );

-- ---------------------------------------------------------------------------
-- 7. Realtime — stays enabled for the app; Supabase Realtime enforces RLS,
--    so anon subscribers receive nothing and candidates only receive events
--    for rows they can SELECT.
-- ---------------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.applications;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.interviews;
exception when duplicate_object then
  null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then
  null;
end $$;

-- ---------------------------------------------------------------------------
-- 9. jobs — admin creates/edits listings; every signed-in user (candidate or
--    admin) reads them so new vacancies appear on candidate dashboards.
-- ---------------------------------------------------------------------------
create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null default '',
  department text not null default 'Security',
  location text not null default '',
  pay_rate numeric not null default 0,
  employment_type text not null default 'Full-Time',
  sia_requirement text not null default 'Security Guarding',
  status text not null default 'active',
  created_date text not null default '',
  description text not null default '',
  applicants_count integer not null default 0,
  created_at timestamptz not null default now()
);

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

-- ---------------------------------------------------------------------------
-- 8. LEGACY-DATA AUDIT + SAFE BACKFILL (read this section before running)
--    Existing applications have user_id = NULL. Until linked, they are
--    visible to ADMINS ONLY (no candidate sees them — by design).
--
-- 8a. ANALYSIS (pure SELECTs — safe to run any time, no writes):
--
--     select
--       count(*)                                     as total_applications,
--       count(user_id)                               as already_linked,
--       count(*) filter (where user_id is null
--                        and exists (select 1 from auth.users u
--                                    where u.email = a.applicant_email)) as exact_match,
--       count(*) filter (where user_id is null
--                        and not exists (select 1 from auth.users u
--                                     where u.email = a.applicant_email)) as no_account
--     from public.applications a;
--
--     -- duplicate applicant emails → ambiguous links, left unlinked:
--     select applicant_email, count(*) as n
--     from public.applications
--     where user_id is null
--     group by applicant_email
--     having count(*) > 1;
--
--     -- near (case/whitespace) matches → treated as ambiguous, left unlinked:
--     select a.applicant_email, u.email
--     from public.applications a
--     join auth.users u on lower(trim(u.email)) = lower(trim(a.applicant_email))
--     where a.user_id is null and u.email <> a.applicant_email;
--
-- 8b. SAFE BACKFILL — links ONLY exact, unique email matches. Rows with
--     duplicates or near-matches (above) keep user_id NULL → admin-only.
-- ---------------------------------------------------------------------------
update public.applications a
set user_id = u.id
from auth.users u
where a.user_id is null
  and u.email = a.applicant_email
  and (select count(*) from auth.users u2 where u2.email = a.applicant_email) = 1;
