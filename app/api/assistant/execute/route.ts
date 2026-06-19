import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { AssistantResultSchema } from "@/lib/ai/action-schema";
import { executeAssistantAction } from "@/lib/ai/execute-assistant-action";

// POST /api/assistant/execute
// Receives a pre-parsed AssistantResult (validated server-side) and executes it.
// Separated from the parse route so the frontend can show the parsed action before confirming.
export async function POST(req: NextRequest) {
  let auth;
  try {
    auth = await requireHousehold();
  } catch {
    return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
  }

  const { householdId, user } = auth;

  const body = await req.json().catch(() => null);
  const parsed = AssistantResultSchema.safeParse(body?.result);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Resultado inválido" }, { status: 400 });
  }

  const result = parsed.data;

  if (result.action === "clarify") {
    return NextResponse.json({ ok: false, error: "No hay acción que ejecutar" }, { status: 400 });
  }

  const supabase = await createClient();
  const execResult = await executeAssistantAction(result, {
    supabase,
    householdId,
    userId: user.id,
  });

  // Surface real errors (e.g. "not found") as ok:false so the frontend shows the message.
  // executed:false with no error means "not implemented yet" → shows "próximamente".
  if (!execResult.executed && execResult.error) {
    return NextResponse.json({ ok: false, error: execResult.error }, { status: 422 });
  }

  return NextResponse.json({ ok: true, executed: execResult.executed });
}
