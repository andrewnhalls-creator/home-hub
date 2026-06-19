-- Home Hub: bank_account field on finance tables
-- Adds a nullable manual label (ING, BBVA, Revolut) to track which account
-- money comes out of / goes into. No bank integration — manual entry only.

alter table public.income_sources
  add column if not exists bank_account text
    check (bank_account in ('ING', 'BBVA', 'Revolut'));

alter table public.fixed_payments
  add column if not exists bank_account text
    check (bank_account in ('ING', 'BBVA', 'Revolut'));

alter table public.expenses
  add column if not exists bank_account text
    check (bank_account in ('ING', 'BBVA', 'Revolut'));

alter table public.subscriptions
  add column if not exists bank_account text
    check (bank_account in ('ING', 'BBVA', 'Revolut'));

alter table public.savings_contributions
  add column if not exists bank_account text
    check (bank_account in ('ING', 'BBVA', 'Revolut'));
