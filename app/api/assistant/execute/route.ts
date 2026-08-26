import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { AssistantResultSchema } from "@/lib/ai/action-schema";
import { executeAssistantAction } from "@/lib/ai/execute-assistant-action";
import { checkRateLimit } from "@/lib/rate-limit";

// POST /api/assistant/execute { pendingActionId }
// Confirms a STORED proposal (created by /api/assistant). The client never
// supplies the action payload. Revalidates ownership, household, expiry and
// schema; the atomic pending→executed claim makes confirmation idempotent —
// a replayed confirm cannot run the action twice.
export async function POST(req: NextRequest) {
  let auth;
  try {
    auth = await requireHousehold();
  } catch {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { householdId, user } = auth;

  if (!checkRateLimit(`assistant-exec:${user.id}`, 20, 60_000)) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas peticiones seguidas. Espera un momento." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const pendingActionId: unknown = body?.pendingActionId;
  if (typeof pendingActionId !== "string" || !pendingActionId) {
    return NextResponse.json({ ok: false, error: "Acción no especificada" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: pending } = await supabase
    .from("pending_ai_actions")
    .select("id, household_id, action, status, expires_at")
    .eq("id", pendingActionId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!pending || pending.household_id !== householdId) {
    return NextResponse.json({ ok: false, error: "Acción no encontrada" }, { status: 404 });
  }

  if (new Date(pending.expires_at) < new Date()) {
    await supabase
      .from("pending_ai_actions")
      .update({ status: "expired" })
      .eq("id", pendingActionId)
      .eq("status", "pending");
    return NextResponse.json(
      { ok: false, error: "La propuesta ha caducado. Vuelve a pedirlo." },
      { status: 410 },
    );
  }

  const parsed = AssistantResultSchema.safeParse(pending.action);
  if (!parsed.success || parsed.data.action === "clarify") {
    return NextResponse.json({ ok: false, error: "Acción no válida" }, { status: 422 });
  }

  // Atomic claim: only one confirm can transition pending → executed.
  const { data: claimed } = await supabase
    .from("pending_ai_actions")
    .update({ status: "executed", executed_at: new Date().toISOString() })
    .eq("id", pendingActionId)
    .eq("status", "pending")
    .select("id");

  if (!claimed?.length) {
    return NextResponse.json(
      { ok: false, error: "Esta acción ya se ha ejecutado o cancelado." },
      { status: 409 },
    );
  }

  const execResult = await executeAssistantAction(parsed.data, {
    supabase,
    householdId,
    userId: user.id,
  });

  if (!execResult.executed && execResult.error) {
    await supabase
      .from("pending_ai_actions")
      .update({ status: "failed", error: execResult.error.slice(0, 300) })
      .eq("id", pendingActionId);
    return NextResponse.json({ ok: false, error: execResult.error }, { status: 422 });
  }

  return NextResponse.json({ ok: true, executed: execResult.executed });
}
