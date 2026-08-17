-- ============================================================================
-- 003 — ADMIN ACCOUNT — CHANGE CREDENTIALS HERE
--   * CHANGE PASSWORD: edit V_ADMIN_PASS below and re-run (applied instantly —
--     no reset link, no email — and all existing admin sessions are revoked).
--   * CHANGE EMAIL: edit V_ADMIN_EMAIL below, delete the old account once:
--       delete from auth.users where email = '<old admin email>';
--     then re-run → a fresh admin account with the new email is created
--     (deleting the auth user removes its profile row too).
--   ⚠ WARNING: running this block ALWAYS overwrites the admin password with
--     the value in V_ADMIN_PASS. Only re-run it when you intend to change
--     credentials. Also: the password sits in plain text in this file — keep
--     the real one out of git; set it here locally right before running.
-- ============================================================================
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