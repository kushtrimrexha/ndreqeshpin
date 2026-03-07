-- ─────────────────────────────────────────────────────────────
--  Stripe + Email columns migration
--  Run this in Supabase SQL Editor
-- ─────────────────────────────────────────────────────────────

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id     TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS premium_plan_type      TEXT,          -- 'monthly' | 'yearly'
  ADD COLUMN IF NOT EXISTS premium_expires_at     TIMESTAMPTZ;

-- Index for fast webhook lookup by subscription ID
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_sub
  ON profiles(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

-- Index for webhook customer lookup
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_cus
  ON profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

-- Verify columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'package_type','stripe_customer_id',
    'stripe_subscription_id','premium_plan_type','premium_expires_at'
  )
ORDER BY column_name;