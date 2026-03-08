-- Step 1: Add 'customer' value to enum (needs its own transaction/migration)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'customer';