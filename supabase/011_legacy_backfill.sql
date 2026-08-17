-- ============================================================================
-- 011 — LEGACY-DATA AUDIT + SAFE BACKFILL (read this before running)
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
-- SAFE BACKFILL — links ONLY exact, unique email matches. Rows with
-- duplicates or near-matches (above) keep user_id NULL → admin-only.
-- ============================================================================
update public.applications a
set user_id = u.id
from auth.users u
where a.user_id is null
  and u.email = a.applicant_email
  and (select count(*) from auth.users u2 where u2.email = a.applicant_email) = 1;