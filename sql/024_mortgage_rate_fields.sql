-- Home Hub: mortgage rate type fields
-- Supports fixed, variable (Euribor-based), and mixed-rate mortgages.
-- euribor_spread is the differential over Euribor (e.g. 1.34 for Euribor +1.34%).
-- fixed_period_end_date is when the fixed-rate period ends on a mixed mortgage.

alter table public.mortgages
  add column if not exists rate_type text check (rate_type in ('fijo', 'variable', 'mixto')) default 'fijo',
  add column if not exists euribor_spread numeric(6, 4),
  add column if not exists fixed_period_end_date date;
