// Home Hub — outbox-worker Edge Function (backend slice B1.3)
// Drains the transactional outbox (public.outbox_jobs): atomic claim with
// lease, per-job dispatch, capped-backoff retries via fail_outbox_job, and
// quiet-hours DEFERRAL (never dropping) via defer_outbox_job.
//
// Job types handled:
//   deliver_notification  { scheduled_notification_id }
//     Creates in-app notification_events idempotently (source_key) for each
//     target user whose preferences allow the category, pushes immediately to
//     users outside quiet hours, and enqueues a per-user deliver_push_event
//     job for users inside quiet hours.
//   deliver_push_event    { event_id, user_id, category }
//     Sends the Web Push for one already-created event; re-defers if the user
//     is (again) inside quiet hours.
//
// Invoked by pg_cron every minute (job "outbox-worker-cron"). Requires the
// same VAPID_* secrets as send-push (send-push remains deployed for its
// device-test mode only).

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7";
import { isInQuietHours, secondsUntilQuietEnd } from "./quiet-hours.ts";
import {
  advanceDateOnly,
  instantFromLocalDateTime,
  nextOccurrenceOnOrAfter,
  wallClockInTimeZone,
  type RecurrenceFrequency,
} from "./recurrence.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;

const TIMEZONE = "Europe/Madrid";
const CLAIM_LIMIT = 20;
const LEASE_SECONDS = 120;

const JSON_HEADERS = { "Content-Type": "application/json" };

type Db = ReturnType<typeof createClient>;

interface OutboxJob {
  id: string;
  job_type: string;
  dedupe_key: string;
  household_id: string | null;
  payload: Record<string, unknown>;
  attempts: number;
}

interface Prefs {
  push_enabled: boolean;
  categories: Record<string, boolean> | null;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  sound_enabled: boolean;
  vibration_enabled: boolean;
}

function adminClient(): Db {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

async function getPrefs(db: Db, userId: string): Promise<Prefs | null> {
  const { data } = await db
    .from("notification_preferences")
    .select("push_enabled, categories, quiet_hours_start, quiet_hours_end")
    .eq("user_id", userId)
    .maybeSingle();
  return data as Prefs | null;
}

function categoryAllowed(prefs: Prefs | null, category: string): boolean {
  if (!prefs) return true; // default on when no prefs row exists
  if (!prefs.push_enabled) return false;
  if (prefs.categories && category in prefs.categories) {
    return prefs.categories[category] === true;
  }
  return true;
}

async function deliverToSubscriptions(
  db: Db,
  eventId: string,
  userId: string,
  title: string,
  body: string | null,
): Promise<{ sent: number; failed: number }> {
  const { data: subscriptions } = await db
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key, sound_enabled, vibration_enabled")
    .eq("user_id", userId)
    .eq("is_active", true);

  let sent = 0;
  let failed = 0;

  for (const sub of (subscriptions ?? []) as SubscriptionRow[]) {
    const payload = JSON.stringify({
      title,
      body: body ?? "",
      url: "/",
      sound: sub.sound_enabled !== false,
      vibrate: sub.vibration_enabled !== false,
    });
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth_key } },
        payload,
      );
      await db.from("notification_delivery_attempts").insert({
        notification_event_id: eventId,
        push_subscription_id: sub.id,
        status: "enviado",
        status_code: 201,
      });
      sent++;
    } catch (err: unknown) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      const message = err instanceof Error ? err.message : "Unknown error";
      await db.from("notification_delivery_attempts").insert({
        notification_event_id: eventId,
        push_subscription_id: sub.id,
        status: "fallido",
        status_code: statusCode ?? null,
        error_message: message.slice(0, 255),
      });
      failed++;
      if (statusCode === 410) {
        await db
          .from("push_subscriptions")
          .update({ is_active: false, deactivated_at: new Date().toISOString() })
          .eq("id", sub.id);
      }
    }
  }
  return { sent, failed };
}

/** Create (or find, on retry) the in-app event for one user, idempotently. */
async function upsertEvent(
  db: Db,
  scheduled: Record<string, unknown>,
  userId: string,
  sourceKey: string,
): Promise<string | null> {
  await db.from("notification_events").upsert(
    {
      household_id: scheduled.household_id,
      user_id: userId,
      category: scheduled.category,
      title: scheduled.title,
      body: scheduled.body ?? null,
      entity_type: scheduled.entity_type ?? null,
      entity_id: scheduled.entity_id ?? null,
      is_read: false,
      source_key: sourceKey,
    },
    { onConflict: "user_id,source_key", ignoreDuplicates: true },
  );
  const { data } = await db
    .from("notification_events")
    .select("id")
    .eq("user_id", userId)
    .eq("source_key", sourceKey)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

async function handleDeliverNotification(
  db: Db,
  job: OutboxJob,
): Promise<string> {
  const scheduledId = job.payload.scheduled_notification_id as string;
  const { data: scheduled } = await db
    .from("scheduled_notifications")
    .select("*")
    .eq("id", scheduledId)
    .maybeSingle();

  if (!scheduled || scheduled.status === "cancelado") return "skipped";

  await db
    .from("scheduled_notifications")
    .update({ status: "procesando" })
    .eq("id", scheduledId);

  let userIds: string[] = [];
  if (scheduled.user_id) {
    userIds = [scheduled.user_id as string];
  } else {
    const { data: members } = await db
      .from("household_members")
      .select("user_id")
      .eq("household_id", scheduled.household_id);
    userIds = ((members ?? []) as { user_id: string }[]).map((m) => m.user_id);
  }

  const sourceKey = `sched:${scheduled.idempotency_key}`;
  const now = new Date();

  for (const userId of userIds) {
    const prefs = await getPrefs(db, userId);
    if (!categoryAllowed(prefs, scheduled.category as string)) continue;

    const eventId = await upsertEvent(db, scheduled, userId, sourceKey);
    if (!eventId) throw new Error(`event creation failed for user ${userId}`);

    if (prefs && isInQuietHours(now, prefs.quiet_hours_start, prefs.quiet_hours_end, TIMEZONE)) {
      // Defer the PUSH (never drop it); the in-app event already exists.
      const deferSeconds = secondsUntilQuietEnd(now, prefs.quiet_hours_end!, TIMEZONE);
      const runAt = new Date(now.getTime() + deferSeconds * 1000).toISOString();
      await db.rpc("enqueue_outbox_job", {
        p_job_type: "deliver_push_event",
        p_dedupe_key: `notifpush:${eventId}`,
        p_household_id: scheduled.household_id,
        p_payload: { event_id: eventId, user_id: userId, category: scheduled.category },
        p_run_at: runAt,
      });
      continue;
    }

    await deliverToSubscriptions(
      db,
      eventId,
      userId,
      scheduled.title as string,
      (scheduled.body as string | null) ?? null,
    );
  }

  await db
    .from("scheduled_notifications")
    .update({ status: "enviado", processed_at: new Date().toISOString() })
    .eq("id", scheduledId);

  // Recurring calendar events re-arm their next occurrence's reminder after
  // each delivery, forming a self-perpetuating per-occurrence chain.
  if (scheduled.entity_type === "calendar_event" && scheduled.entity_id) {
    await rearmCalendarReminder(db, scheduled.entity_id as string);
  }

  return "done";
}

async function rearmCalendarReminder(db: Db, eventId: string): Promise<void> {
  const { data: event } = await db
    .from("calendar_events")
    .select("household_id, title, event_date, event_time, repeat_frequency, remind_before_minutes, deleted_at")
    .eq("id", eventId)
    .maybeSingle();
  if (
    !event ||
    event.deleted_at ||
    event.repeat_frequency === "ninguna" ||
    event.remind_before_minutes === null ||
    event.remind_before_minutes === undefined
  ) {
    return;
  }

  const { data: exceptions } = await db
    .from("calendar_event_exceptions")
    .select("occurrence_date")
    .eq("event_id", eventId);
  const skipped = new Set(
    ((exceptions ?? []) as { occurrence_date: string }[]).map((e) => e.occurrence_date),
  );

  // Search from tomorrow (Madrid) so the just-delivered occurrence is skipped.
  const w = wallClockInTimeZone(new Date(), TIMEZONE);
  const pad = (n: number) => String(n).padStart(2, "0");
  const madridToday = `${w.year}-${pad(w.month)}-${pad(w.day)}`;
  const from = advanceDateOnly(madridToday, "diaria");

  const next = nextOccurrenceOnOrAfter(
    event.event_date as string,
    event.repeat_frequency as RecurrenceFrequency,
    from,
    skipped,
  );
  if (!next) return;

  const time = (event.event_time as string | null)?.slice(0, 5) || "09:00";
  const instant = instantFromLocalDateTime(next, time, TIMEZONE);
  const scheduledFor = new Date(
    new Date(instant).getTime() - Number(event.remind_before_minutes) * 60 * 1000,
  ).toISOString();

  await db.from("scheduled_notifications").upsert(
    {
      household_id: event.household_id,
      user_id: null,
      category: "calendario",
      entity_type: "calendar_event",
      entity_id: eventId,
      scheduled_for: scheduledFor,
      title: "Evento en el calendario",
      body: event.title,
      idempotency_key: `calendar_event:${eventId}:${scheduledFor}`,
    },
    { onConflict: "idempotency_key", ignoreDuplicates: true },
  );
}

async function handleDeliverPushEvent(db: Db, job: OutboxJob): Promise<string> {
  const eventId = job.payload.event_id as string;
  const userId = job.payload.user_id as string;
  const category = (job.payload.category as string) ?? "";

  const { data: event } = await db
    .from("notification_events")
    .select("id, title, body")
    .eq("id", eventId)
    .maybeSingle();
  if (!event) return "skipped";

  const prefs = await getPrefs(db, userId);
  if (!categoryAllowed(prefs, category)) return "skipped";

  const now = new Date();
  if (prefs && isInQuietHours(now, prefs.quiet_hours_start, prefs.quiet_hours_end, TIMEZONE)) {
    const deferSeconds = secondsUntilQuietEnd(now, prefs.quiet_hours_end!, TIMEZONE);
    await db.rpc("defer_outbox_job", { p_job_id: job.id, p_defer_seconds: deferSeconds });
    return "deferred";
  }

  await deliverToSubscriptions(
    db,
    eventId,
    userId,
    event.title as string,
    (event.body as string | null) ?? null,
  );
  return "done";
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: JSON_HEADERS,
    });
  }

  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
  const db = adminClient();
  const workerId = `edge:${crypto.randomUUID().slice(0, 8)}`;

  const { data: jobs, error: claimError } = await db.rpc("claim_outbox_jobs", {
    p_worker: workerId,
    p_limit: CLAIM_LIMIT,
    p_lease_seconds: LEASE_SECONDS,
  });

  if (claimError) {
    console.error("claim error:", claimError.message);
    return new Response(JSON.stringify({ error: "claim failed" }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  const summary = { claimed: (jobs ?? []).length, done: 0, deferred: 0, skipped: 0, failed: 0 };

  for (const job of (jobs ?? []) as OutboxJob[]) {
    try {
      let outcome: string;
      switch (job.job_type) {
        case "deliver_notification":
          outcome = await handleDeliverNotification(db, job);
          break;
        case "deliver_push_event":
          outcome = await handleDeliverPushEvent(db, job);
          break;
        default:
          throw new Error(`unknown job_type: ${job.job_type}`);
      }
      if (outcome === "deferred") {
        summary.deferred++;
        continue; // defer_outbox_job already rescheduled it
      }
      await db.rpc("complete_outbox_job", { p_job_id: job.id });
      if (outcome === "skipped") summary.skipped++;
      else summary.done++;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "unknown error";
      console.error(`job ${job.id} (${job.job_type}) failed:`, message);
      await db.rpc("fail_outbox_job", { p_job_id: job.id, p_error: message });
      summary.failed++;
    }
  }

  return new Response(JSON.stringify(summary), { headers: JSON_HEADERS });
});
