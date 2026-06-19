-- Home Hub: subscriptions — add billing_day, billing_interval_days, last_payment_date, start_date
-- Supports paid/pending status chips (via billing_day + 25-to-25 cycle logic),
-- custom-interval billing (billing_interval_days for Real Debrid 180-day), and future-dated starts.

-- Drop and recreate billing_cycle constraint to add 'otro'
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_billing_cycle_check;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_billing_cycle_check
  CHECK (billing_cycle IN ('mensual', 'trimestral', 'anual', 'otro'));

-- Add new columns
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS billing_day smallint CHECK (billing_day BETWEEN 1 AND 31),
  ADD COLUMN IF NOT EXISTS billing_interval_days int,
  ADD COLUMN IF NOT EXISTS last_payment_date date,
  ADD COLUMN IF NOT EXISTS start_date date;
