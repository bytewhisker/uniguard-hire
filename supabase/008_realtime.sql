-- ============================================================================
-- 008 — Realtime: stays enabled for the app; Supabase Realtime enforces RLS,
-- so anon subscribers receive nothing and candidates only receive events
-- for rows they can SELECT.
-- ============================================================================
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