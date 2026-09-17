-- Safe to run against ANY previous version of this database, any number of
-- times — every statement is guarded, so it only applies what's actually
-- missing. Paste into Neon's SQL Editor and run whenever this project's
-- schema has changed.

create extension if not exists "pgcrypto";

create table if not exists disciplines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  why_note text,
  start_date timestamptz not null default now(),
  max_streak integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists reset_log (
  id uuid primary key default gen_random_uuid(),
  discipline_id uuid not null references disciplines(id) on delete cascade,
  streak_reached integer not null,
  note text,
  reset_at timestamptz not null default now()
);

alter table disciplines drop column if exists color;
alter table disciplines add column if not exists public_token text not null default gen_random_uuid()::text;
alter table disciplines add column if not exists archived_at timestamptz;
alter table disciplines add column if not exists reset_count integer not null default 0;
alter table disciplines alter column start_date drop not null;
update disciplines set why_note = 'No reason given yet.' where why_note is null;
alter table disciplines alter column why_note set not null;

alter table reset_log add column if not exists run_start timestamptz;
-- Backfill run_start for any older rows that predate this column, using the
-- best available estimate (reset time minus the logged streak length).
update reset_log set run_start = reset_at - (streak_reached || ' days')::interval
  where run_start is null;
alter table reset_log alter column run_start set not null;

-- Only meaningful once a discipline is archived (same as archived_at), so
-- it stays nullable at the DB level - "required" is enforced by the
-- archive API and the confirm dialog, not a NOT NULL constraint, since a
-- constraint here would also force a value onto every active discipline
-- that was never archived at all.
alter table disciplines add column if not exists archive_reason text;

-- Fixed-length challenges ("3 day challenge") vs the open-ended tier
-- ladder. NULL means the ladder, which is what every row that existed
-- before this column was added gets automatically - so adding this
-- changes nothing about any commitment already running. A value of N
-- means the commitment completes when it reaches N days.
alter table disciplines add column if not exists goal_days integer;
alter table disciplines drop constraint if exists disciplines_goal_days_sane;
alter table disciplines add constraint disciplines_goal_days_sane
  check (goal_days is null or (goal_days >= 1 and goal_days <= 365));

create index if not exists reset_log_discipline_id_idx on reset_log(discipline_id);
