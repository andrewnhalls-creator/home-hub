// Home Hub — send-push Edge Function
// Sends Web Push notifications via VAPID.
//
// Required Supabase Edge Function secrets (set via Supabase dashboard or CLI):
//   VAPID_PUBLIC_KEY   — VAPID public key (same value as NEXT_PUBLIC_VAPID_PUBLIC_KEY in the app)
//   VAPID_PRIVATE_KEY  — VAPID private key (NEVER commit)
//   VAPID_SUBJECT      — mailto: URI e.g. mailto:andrew.halls@hotmail.es
//
// Built-in Supabase secrets (auto-provided, do not set manually):
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   SUPABASE_ANON_KEY
//
// Invocation modes:
//   { mode: "scheduled" } — process pending scheduled_notifications (called by Supabase Cron)
//   { mode: "test", event_id: "..." } — deliver push for a specific notification_event

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "https://esm.sh/web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")!;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const JSON_HEADERS = {
  ...CORS_HEADERS,
  "Content-Type": "application/json",
};

// ---------- Types matching the database schema ----------

interface PushSubscriptionRow {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
}

interface NotificationEventRow {
  id: string;
  household_id: string;
  user_id: string;
  category: string;
  title: string;
  body: string | null;
}

interface ScheduledNotificationRow {
  id: string;
  household_id: string;
  user_id: string | null;
  category: string;
  title: string;
  body: string | null;
  entity_type: string | null;
  entity_id: string | null;
}

interface NotificationPreferencesRow {
  push_enabled: boolean;
  categories: Record<string, boolean>;
  quiet_hours_start: string | null;
  quiet_hours_end: string | null;
}

// ---------- Helpers ----------

function adminClient() {
  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
}

async function getUserPreferences(
  db: ReturnType<typeof adminClient>,
  userId: string,
): Promise<NotificationPreferencesRow | null> {
  const { data } = await db
    .from("notification_preferences")
    .select("push_enabled, categories, quiet_hours_start, quiet_hours_end")
    .eq("user_id", userId)
    .maybeSingle();
  return data;
}

function isInQuietHours(prefs: NotificationPreferencesRow): boolean {
  if (!prefs.quiet_hours_start || !prefs.quiet_hours_end) return false;
  const now = new Date();
  const hhmm = now.toLocaleTimeString("en-US", {
    timeZone: "Europe/Madrid",
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
  }).slice(0, 5); // "HH:MM"
  const start = prefs.quiet_hours_start.slice(0, 5);
  const end = prefs.quiet_hours_end.slice(0, 5);
  // Handle overnight range (e.g. 23:00 → 08:00)
  return start <= end ? hhmm >= start && hhmm < end : hhmm >= start || hhmm < end;
}

function isPushAllowed(
  prefs: NotificationPreferencesRow | null,
  category: string,
): boolean {
  if (!prefs) return true; // default on if no prefs row
  if (!prefs.push_enabled) return false;
  if (isInQuietHours(prefs)) return false;
  if (prefs.categories && category in prefs.categories) {
    return prefs.categories[category] === true;
  }
  return true;
}

async function deliverToSubscriptions(
  db: ReturnType<typeof adminClient>,
  eventId: string,
  userId: string,
  title: string,
  body: string | null,
  url: string = "/",
): Promise<{ sent: number; failed: number }> {
  const { data: subscriptions } = await db
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth_key")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (!subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const payload = JSON.stringify({ title, body: body ?? "", url });
  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions as PushSubscriptionRow[]) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth_key },
        },
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

      // 410 Gone: endpoint expired — deactivate the subscription
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

// ---------- Mode: process scheduled_notifications (cron) ----------

async function processScheduled(db: ReturnType<typeof adminClient>): Promise<Response> {
  const { data: pending, error } = await db
    .from("scheduled_notifications")
    .select("*")
    .eq("status", "pendiente")
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(50);

  if (error) {
    console.error("scheduled query error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  if (!pending || pending.length === 0) {
    return new Response(JSON.stringify({ processed: 0, sent: 0, failed: 0 }), {
      headers: JSON_HEADERS,
    });
  }

  let totalSent = 0;
  let totalFailed = 0;

  for (const scheduled of pending as ScheduledNotificationRow[]) {
    // Mark as processing to prevent double-delivery if cron overlaps
    await db
      .from("scheduled_notifications")
      .update({ status: "procesando" })
      .eq("id", scheduled.id)
      .eq("status", "pendiente"); // only if still pending (optimistic lock)

    // Resolve target user IDs
    let userIds: string[] = [];
    if (scheduled.user_id) {
      userIds = [scheduled.user_id];
    } else {
      const { data: members } = await db
        .from("household_members")
        .select("user_id")
        .eq("household_id", scheduled.household_id);
      userIds = (members ?? []).map((m: { user_id: string }) => m.user_id);
    }

    let scheduledStatus = "enviado";

    for (const userId of userIds) {
      const prefs = await getUserPreferences(db, userId);
      if (!isPushAllowed(prefs, scheduled.category)) continue;

      // Create notification_event for the in-app feed
      const { data: event } = await db
        .from("notification_events")
        .insert({
          household_id: scheduled.household_id,
          user_id: userId,
          category: scheduled.category,
          title: scheduled.title,
          body: scheduled.body ?? null,
          entity_type: scheduled.entity_type ?? null,
          entity_id: scheduled.entity_id ?? null,
          is_read: false,
        })
        .select("id")
        .single();

      if (!event) {
        scheduledStatus = "fallido";
        continue;
      }

      const { sent, failed } = await deliverToSubscriptions(
        db,
        event.id,
        userId,
        scheduled.title,
        scheduled.body,
      );
      totalSent += sent;
      totalFailed += failed;
    }

    await db
      .from("scheduled_notifications")
      .update({ status: scheduledStatus, processed_at: new Date().toISOString() })
      .eq("id", scheduled.id);
  }

  return new Response(
    JSON.stringify({ processed: pending.length, sent: totalSent, failed: totalFailed }),
    { headers: JSON_HEADERS },
  );
}

// ---------- Mode: deliver a specific notification_event ----------

async function deliverEvent(
  db: ReturnType<typeof adminClient>,
  eventId: string,
): Promise<Response> {
  const { data: event } = await db
    .from("notification_events")
    .select("id, household_id, user_id, category, title, body")
    .eq("id", eventId)
    .single();

  if (!event) {
    return new Response(JSON.stringify({ error: "Event not found" }), {
      status: 404,
      headers: JSON_HEADERS,
    });
  }

  const prefs = await getUserPreferences(db, (event as NotificationEventRow).user_id);
  if (!isPushAllowed(prefs, (event as NotificationEventRow).category)) {
    return new Response(
      JSON.stringify({ sent: 0, failed: 0, skipped: "push disabled for this category" }),
      { headers: JSON_HEADERS },
    );
  }

  const { sent, failed } = await deliverToSubscriptions(
    db,
    (event as NotificationEventRow).id,
    (event as NotificationEventRow).user_id,
    (event as NotificationEventRow).title,
    (event as NotificationEventRow).body,
  );

  return new Response(JSON.stringify({ sent, failed }), { headers: JSON_HEADERS });
}

// ---------- Entry point ----------

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: CORS_HEADERS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: JSON_HEADERS,
    });
  }

  try {
    // Validate required secrets at runtime so missing config surfaces clearly
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_SUBJECT) {
      console.error("Missing VAPID secrets");
      return new Response(JSON.stringify({ error: "Server misconfigured" }), {
        status: 500,
        headers: JSON_HEADERS,
      });
    }

    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

    const body = await req.json().catch(() => ({}));
    const mode: string = body.mode ?? "scheduled";
    const db = adminClient();

    // Test/direct mode requires a valid user JWT
    if (mode === "test") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: JSON_HEADERS,
        });
      }
      const userClient = createClient(SUPABASE_URL, ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      });
      const {
        data: { user },
      } = await userClient.auth.getUser();
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: JSON_HEADERS,
        });
      }

      if (!body.event_id) {
        return new Response(JSON.stringify({ error: "event_id required" }), {
          status: 400,
          headers: JSON_HEADERS,
        });
      }

      return await deliverEvent(db, body.event_id);
    }

    // Scheduled mode (cron): no user auth needed — service role handles access
    return await processScheduled(db);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("send-push unhandled error:", message);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }
});
