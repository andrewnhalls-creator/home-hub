-- Add multi-day event support and per-event colour customisation to calendar_events.
-- end_date: last day of a multi-day event (null = single-day).
-- color: optional hex colour string for visual customisation (#rrggbb).

ALTER TABLE calendar_events
  ADD COLUMN IF NOT EXISTS end_date date,
  ADD COLUMN IF NOT EXISTS color text;
