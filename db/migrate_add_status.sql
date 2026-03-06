-- Migration: add approval_status enum and status columns
-- Run this ONCE before seed_synthetic_data.sql if your schema lacks the status column.
--
-- Usage:
--   psql -d your_database -f db/migrate_add_status.sql

DO $$ BEGIN
  CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE model_cards ADD COLUMN IF NOT EXISTS status approval_status NOT NULL DEFAULT 'pending';
ALTER TABLE datasheets  ADD COLUMN IF NOT EXISTS status approval_status NOT NULL DEFAULT 'pending';
