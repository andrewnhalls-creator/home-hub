-- Migration 018: Document expiry push alert function
-- A daily pg_cron job calls scan_document_expiry_notifications() which inserts
-- rows into scheduled_notifications for documents expiring in 30, 7, or 1 day.
-- The existing send-push cron (every minute) picks them up and delivers via Web Push.
-- Deduplication is handled by the idempotency_key unique constraint.

CREATE OR REPLACE FUNCTION public.scan_document_expiry_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  threshold int;
  doc record;
  label text;
  ikey text;
BEGIN
  FOREACH threshold IN ARRAY ARRAY[1, 7, 30] LOOP
    CASE threshold
      WHEN 1  THEN label := 'mañana';
      WHEN 7  THEN label := 'en 7 días';
      ELSE         label := 'en 30 días';
    END CASE;

    FOR doc IN
      SELECT id, household_id, title
      FROM public.household_documents
      WHERE deleted_at IS NULL
        AND archived_at IS NULL
        AND expiry_date IS NOT NULL
        AND expiry_date = CURRENT_DATE + threshold
    LOOP
      ikey := 'document_expiry:' || doc.id::text || ':' || threshold::text;

      INSERT INTO public.scheduled_notifications (
        household_id,
        user_id,
        category,
        entity_type,
        entity_id,
        scheduled_for,
        title,
        body,
        idempotency_key
      ) VALUES (
        doc.household_id,
        NULL,
        'documentos',
        'document',
        doc.id,
        now(),
        doc.title || ' caduca ' || label,
        'Recuerda renovarlo a tiempo.',
        ikey
      )
      ON CONFLICT (idempotency_key) DO NOTHING;
    END LOOP;
  END LOOP;
END;
$$;
