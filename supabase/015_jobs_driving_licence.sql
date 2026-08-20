-- ============================================================================
-- 015 — jobs: add UK driving licence requirement column, then seed the initial
-- vacancies (demo hourly rates). Run once in the Supabase SQL editor.
-- ============================================================================

alter table public.jobs
  add column if not exists driving_licence_required boolean not null default false;

-- Seed initial vacancies (idempotent: skips if a title already exists)
insert into public.jobs (title, location, pay_rate, employment_type, sia_required, driving_licence_required, status, created_date, description)
select 'Accounts Assistant', 'Head Office — West Midlands', 13.00, 'Part-Time', false, false, 'active', current_date::text,
  'Accounts Assistant — part time / full time. Immediate start available for the right calibre of candidate.'
where not exists (select 1 from public.jobs where title = 'Accounts Assistant');

insert into public.jobs (title, location, pay_rate, employment_type, sia_required, driving_licence_required, status, created_date, description)
select 'Help Desk Operator / Resource Planner', 'Head Office — West Midlands', 14.00, 'Full-Time', false, false, 'active', current_date::text,
  'Help Desk Operator / Resource Planner — full time. Immediate start available for the right calibre of candidate.'
where not exists (select 1 from public.jobs where title = 'Help Desk Operator / Resource Planner');

insert into public.jobs (title, location, pay_rate, employment_type, sia_required, driving_licence_required, status, created_date, description)
select 'Mobile Response Drivers', 'West Midlands & Nationwide', 15.00, 'Shift-Based', true, true, 'active', current_date::text,
  'Mobile Response Driver. Valid SIA licence essential. Full UK driving licence and own transport preferred (ability to travel between sites). Immediate start available for the right calibre of candidate.'
where not exists (select 1 from public.jobs where title = 'Mobile Response Drivers');

insert into public.jobs (title, location, pay_rate, employment_type, sia_required, driving_licence_required, status, created_date, description)
select 'Security Officers', 'Birmingham, Stafford, Stoke on Trent, Wolverhampton, Manchester, London, Glasgow, Edinburgh, Oxford, Reading, Liverpool, Southampton, Plymouth', 14.50, 'Full-Time', true, true, 'active', current_date::text,
  'Security Officer. Valid SIA licence essential for all security officer roles. Full UK driving licence and own transport preferred (ability to travel between sites). Immediate start available for the right calibre of candidate.'
where not exists (select 1 from public.jobs where title = 'Security Officers');