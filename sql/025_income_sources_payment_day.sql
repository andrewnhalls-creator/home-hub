-- Home Hub: income_sources — add payment_day + quincenal frequency
-- Adds support for fortnightly income (e.g. biweekly pension) and a per-source payment day.

-- Drop and recreate the frequency check constraint to add 'quincenal'
ALTER TABLE public.income_sources
  DROP CONSTRAINT IF EXISTS income_sources_frequency_check;

ALTER TABLE public.income_sources
  ADD CONSTRAINT income_sources_frequency_check
  CHECK (frequency IN ('mensual', 'trimestral', 'anual', 'quincenal'));

-- Add payment_day (nullable, day of month 1–31)
ALTER TABLE public.income_sources
  ADD COLUMN IF NOT EXISTS payment_day smallint CHECK (payment_day BETWEEN 1 AND 31);
