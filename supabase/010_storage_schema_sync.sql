-- ============================================================================
-- 010 — STORAGE SCHEMA SYNC — fixes "The database schema is out of sync"
-- upload errors. The storage API now writes owner_id / version / user_metadata
-- on every upload; projects created before storage migrations 0016/0018/0025
-- are missing these columns. Idempotent. Run this BEFORE any evidence upload.
--
-- New-format Supabase projects already ship these columns and lock the
-- storage schema to supabase_storage_admin, so this block auto-applies when
-- the editor has ownership and skips (with a notice) otherwise — no error.
-- ============================================================================
do $$
begin
  execute 'set role supabase_storage_admin';

  execute 'alter table storage.objects add column if not exists version text default null';
  execute 'alter table storage.objects add column if not exists owner_id text default null';
  execute 'alter table storage.objects add column if not exists user_metadata jsonb null';
  execute 'alter table storage.buckets add column if not exists owner_id text default null';
  execute 'alter table storage.buckets drop constraint if exists buckets_owner_fkey';

  execute 'reset role';
  raise notice 'STORAGE SYNC OK: storage schema columns ensured.';
exception when insufficient_privilege then
  execute 'reset role';
  raise notice 'STORAGE SYNC SKIPPED: storage schema is managed by Supabase on this project (columns already present on new projects). If uploads still report "out of sync", contact Supabase support.';
end $$;