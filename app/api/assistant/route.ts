import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { routeToProvider } from "@/lib/ai/provider-router";
import { executeAssistantAction } from "@/lib/ai/execute-assistant-action";

// POST /api/assistant
// Parses a natural-language household command into a structured action.
// Pass autoExecute: true in the body to immediately run safe, non-destructive actions.
export async function POST(req: NextRequest) {
  let auth;
  try {
    auth = await requireHousehold();
  } catch {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { householdId, user } = auth;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ ok: false, error: "Mensaje requerido" }, { status: 400 });
  }

  const message: string = body.message.trim();
  const autoExecute: boolean = body.autoExecute === true;

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

  let executed = false;
  if (autoExecute && !result.requiresConfirmation && result.action !== "clarify") {
    const supabase = await createClient();
    const execResult = await executeAssistantAction(result, {
      supabase,
      householdId,
      userId: user.id,
    });
    executed = execResult.executed;
  }

  return NextResponse.json({ ok: true, provider, result, executed });
}
