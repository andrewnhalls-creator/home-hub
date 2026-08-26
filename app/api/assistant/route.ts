import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { routeToProvider } from "@/lib/ai/provider-router";
import { checkRateLimit } from "@/lib/rate-limit";

// POST /api/assistant
// Parses a natural-language household command into a structured action and
// stores it as a short-lived pending proposal. Nothing is ever executed here;
// /api/assistant/execute confirms the STORED proposal by id.
export async function POST(req: NextRequest) {
  let auth;
  try {
    auth = await requireHousehold();
  } catch {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { householdId, user } = auth;

  if (!checkRateLimit(`assistant:${user.id}`, 20, 60_000)) {
    return NextResponse.json(
      { ok: false, error: "Demasiadas peticiones seguidas. Espera un momento." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ ok: false, error: "Mensaje requerido" }, { status: 400 });
  }

  const message: string = body.message.trim();

  const routed = await routeToProvider(message);

  if (!routed) {
    return NextResponse.json(
      {
        ok: false,
        error: "El asistente no está disponible ahora mismo. Inténtalo más tarde.",
      },
      { status: 503 },
    );
  }

  const { provider, result } = routed;

  // Every write goes through the stored-proposal + explicit-confirmation
  // lifecycle — there is no silent-execution path (migration 045).
  let pendingActionId: string | null = null;
  if (result.action !== "clarify") {
    const supabase = await createClient();
    const actionHash = createHash("sha256")
      .update(JSON.stringify({ action: result.action, payload: result.payload }))
      .digest("hex");
    const { data: pending, error: pendingError } = await supabase
      .from("pending_ai_actions")
      .insert({
        household_id: householdId,
        user_id: user.id,
        action: result,
        action_hash: actionHash,
      })
      .select("id")
      .single();
    if (pendingError || !pending) {
      return NextResponse.json(
        { ok: false, error: "No se ha podido preparar la acción. Inténtalo de nuevo." },
        { status: 500 },
      );
    }
    pendingActionId = pending.id;
  }

  return NextResponse.json({ ok: true, provider, result, pendingActionId });
}
