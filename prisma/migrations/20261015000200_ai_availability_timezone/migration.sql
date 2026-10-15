-- Existing values were written as UTC ISO timestamps. Preserve that instant
-- when making cooldown timestamps unambiguous across server timezones.
ALTER TABLE "AiGlobalUsage"
  ALTER COLUMN "unavailableUntil" TYPE TIMESTAMPTZ(3)
  USING "unavailableUntil" AT TIME ZONE 'UTC';
