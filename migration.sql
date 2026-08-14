-- Run this once against your Neon database (SQL Editor in the Neon
-- console, or `psql "$DATABASE_URL" -f migration.sql`).
-- Fresh install only. If you already ran the original migration.sql,
-- use migration-v2.sql instead — this one will just no-op harmlessly
-- on tables that already exist.

create extension if not exists "pgcrypto";

create table if not exists disciplines (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  why_note text,
  start_date timestamptz not null default now(),
  max_streak integer not null default 0,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  public_token text not null default gen_random_uuid()::text
);

create table if not exists reset_log (
  id uuid primary key default gen_random_uuid(),
  discipline_id uuid not null references disciplines(id) on delete cascade,
  streak_reached integer not null,
  note text,
  reset_at timestamptz not null default now()
);

create index if not exists reset_log_discipline_id_idx on reset_log(discipline_id);
