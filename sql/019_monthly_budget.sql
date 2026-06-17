-- Migration 019: Add monthly_budget to households
-- Enables the Resumen tab budget tracker (variable expenses vs. monthly limit).

ALTER TABLE public.households ADD COLUMN IF NOT EXISTS monthly_budget numeric;
