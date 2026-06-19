-- Migration 028: household current balance + Pago extraordinario category
-- Applied 2026-06-19

-- Add current account balance snapshot to households
ALTER TABLE public.households
  ADD COLUMN IF NOT EXISTS current_balance numeric(14, 2);

-- Add "Pago extraordinario" finance category (seed per household, idempotent)
INSERT INTO public.categories (household_id, name, module)
SELECT h.id, 'Pago extraordinario', 'finance'
FROM public.households h
ON CONFLICT DO NOTHING;
