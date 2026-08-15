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
update disciplines set why_note = 'No reason given yet.' where why_note is null;
alter table disciplines alter column why_note set not null;

alter table reset_log add column if not exists run_start timestamptz;
-- Backfill run_start for any older rows that predate this column, using the
-- best available estimate (reset time minus the logged streak length).
update reset_log set run_start = reset_at - (streak_reached || ' days')::interval
  where run_start is null;
alter table reset_log alter column run_start set not null;

create index if not exists reset_log_discipline_id_idx on reset_log(discipline_id);
