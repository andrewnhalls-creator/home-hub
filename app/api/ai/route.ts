import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { revalidatePath } from "next/cache";

interface AddShoppingItemAction {
  type: "add_shopping_item";
  name: string;
  quantity?: number;
  unit?: string;
  store?: string;
  priority?: "baja" | "normal" | "alta";
}

interface CreateReminderAction {
  type: "create_reminder";
  title: string;
  description?: string;
  due_at?: string;
}

interface CreateChoreAction {
  type: "create_chore";
  title: string;
  description?: string;
  frequency?: "puntual" | "diaria" | "semanal" | "quincenal" | "mensual";
  next_due_date?: string;
}

interface CreateExpenseAction {
  type: "create_expense";
  title: string;
  amount: number;
  expense_date?: string;
  notes?: string;
}

interface CreateSubscriptionAction {
  type: "create_subscription";
  name: string;
  amount: number;
  billing_cycle: "mensual" | "trimestral" | "anual";
  renewal_date?: string;
}

interface CreateFixedPaymentAction {
  type: "create_fixed_payment";
  name: string;
  amount: number;
  due_day: number;
}

interface NoOpAction {
  type: "suggest_recipe" | "suggest_meal_plan" | "organise_shopping_list";
}

type Action =
  | AddShoppingItemAction
  | CreateReminderAction
  | CreateChoreAction
  | CreateExpenseAction
  | CreateSubscriptionAction
  | CreateFixedPaymentAction
  | NoOpAction;

interface GeminiResponse {
  message: string;
  actions: Action[];
}

const ACTION_SCHEMA = `
Actions you can take (include in the "actions" array):

{ "type": "add_shopping_item", "name": "string (required)", "quantity": number, "unit": "string", "store": "string", "priority": "baja|normal|alta" }
{ "type": "create_reminder", "title": "string (required)", "description": "string", "due_at": "ISO datetime string e.g. 2026-06-20T10:00:00" }
{ "type": "create_chore", "title": "string (required)", "description": "string", "frequency": "puntual|diaria|semanal|quincenal|mensual", "next_due_date": "ISO date string e.g. 2026-06-25" }
{ "type": "create_expense", "title": "string (required)", "amount": number (required), "expense_date": "ISO date string", "notes": "string" }
{ "type": "create_subscription", "name": "string (required)", "amount": number (required), "billing_cycle": "mensual|trimestral|anual", "renewal_date": "ISO date string" }
{ "type": "create_fixed_payment", "name": "string (required)", "amount": number (required), "due_day": number 1-31 (required) }
{ "type": "suggest_recipe" }
{ "type": "suggest_meal_plan" }
{ "type": "organise_shopping_list" }

For read-only questions (what's on the list, how much did we spend, etc.) return "actions": [].
For suggestions (recipe, meal plan, shopping organisation) return the action type but no DB write occurs.
`;

function buildSystemPrompt(today: string): string {
  return `You are a household assistant for a Spanish couple managing their home with Home Hub.

TODAY'S DATE: ${today}

LANGUAGE: The user may write in English or Spanish. ALWAYS respond in Spanish (Spain, es-ES).
All record names, titles, and text you create in actions must be in Spanish.

You have access to live household data provided below. Use it to answer questions accurately.
Do not invent data that is not in the context. If you cannot answer from the provided context, say so clearly in Spanish.

Never give financial, legal, or health advice.

Return ONLY valid JSON in this exact shape — no markdown, no code fences, just the raw JSON:
{
  "message": "Your response in Spanish (Spain)",
  "actions": []
}

${ACTION_SCHEMA}`;
}

async function fetchHouseholdContext(supabase: Awaited<ReturnType<typeof createClient>>, householdId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const in14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7) + "-01";
  const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().slice(0, 10);
  const weekStart = (() => {
    const d = new Date();
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate() + diff);
    return d.toISOString().slice(0, 10);
  })();
  const weekEnd = (() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  })();

  const [
    { data: shoppingItems },
    { data: mealPlans },
    { data: reminders },
    { data: chores },
    { data: expenses },
    { data: subscriptions },
    { data: paymentInstances },
    { data: recipes },
  ] = await Promise.all([
    supabase
      .from("shopping_items")
      .select("name, quantity, unit, store, priority, is_completed")
      .eq("household_id", householdId)
      .eq("is_completed", false)
      .limit(50),
    supabase
      .from("meal_plans")
      .select("planned_date, meal_type, custom_name, recipes(name)")
      .eq("household_id", householdId)
      .gte("planned_date", weekStart)
      .lte("planned_date", weekEnd)
      .order("planned_date"),
    supabase
      .from("reminders")
      .select("title, due_at, status")
      .eq("household_id", householdId)
      .eq("status", "pendiente")
      .gte("due_at", today)
      .lte("due_at", in14Days + "T23:59:59")
      .is("deleted_at", null)
      .order("due_at")
      .limit(20),
    supabase
      .from("chores")
      .select("title, frequency, next_due_date, status")
      .eq("household_id", householdId)
      .in("status", ["pendiente", "vencido"])
      .limit(20),
    supabase
      .from("expenses")
      .select("title, amount, expense_date")
      .eq("household_id", householdId)
      .gte("expense_date", monthStart)
      .lte("expense_date", monthEnd)
      .is("deleted_at", null)
      .order("expense_date", { ascending: false })
      .limit(50),
    supabase
      .from("subscriptions")
      .select("name, amount, billing_cycle, renewal_date")
      .eq("household_id", householdId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("renewal_date")
      .limit(30),
    supabase
      .from("payment_instances")
      .select("fixed_payments(name), amount, due_date, status")
      .eq("household_id", householdId)
      .in("status", ["pendiente", "vencido"])
      .gte("due_date", today)
      .limit(20),
    supabase
      .from("recipes")
      .select("name, description")
      .eq("household_id", householdId)
      .limit(30),
  ]);

  return {
    lista_compra: shoppingItems ?? [],
    menu_semana: (mealPlans ?? []).map((m) => ({
      fecha: m.planned_date,
      tipo: m.meal_type,
      plato: m.custom_name ?? (m.recipes as { name?: string } | null)?.name ?? "",
    })),
    recordatorios_proximos: reminders ?? [],
    tareas_pendientes: chores ?? [],
    gastos_mes: expenses ?? [],
    suscripciones: subscriptions ?? [],
    pagos_proximos: (paymentInstances ?? []).map((p) => ({
      nombre: (p.fixed_payments as { name?: string } | null)?.name ?? "",
      importe: p.amount,
      vencimiento: p.due_date,
      estado: p.status,
    })),
    recetas_guardadas: recipes ?? [],
  };
}

async function executeActions(
  supabase: Awaited<ReturnType<typeof createClient>>,
  householdId: string,
  userId: string,
  actions: Action[],
): Promise<number> {
  let executed = 0;
  const affectedPaths: string[] = [];

  for (const action of actions) {
    try {
      switch (action.type) {
        case "add_shopping_item": {
          const a = action as AddShoppingItemAction;
          await supabase.from("shopping_items").insert({
            household_id: householdId,
            name: a.name,
            quantity: a.quantity ?? null,
            unit: a.unit ?? null,
            store: a.store ?? null,
            priority: a.priority ?? "normal",
            created_by: userId,
          });
          affectedPaths.push("/compra");
          executed++;
          break;
        }
        case "create_reminder": {
          const a = action as CreateReminderAction;
          await supabase.from("reminders").insert({
            household_id: householdId,
            title: a.title,
            description: a.description ?? null,
            due_at: a.due_at ?? null,
            status: "pendiente",
            created_by: userId,
          });
          affectedPaths.push("/recordatorios");
          executed++;
          break;
        }
        case "create_chore": {
          const a = action as CreateChoreAction;
          await supabase.from("chores").insert({
            household_id: householdId,
            title: a.title,
            description: a.description ?? null,
            frequency: a.frequency ?? "puntual",
            next_due_date: a.next_due_date ?? null,
            status: "pendiente",
            created_by: userId,
          });
          affectedPaths.push("/tareas");
          executed++;
          break;
        }
        case "create_expense": {
          const a = action as CreateExpenseAction;
          await supabase.from("expenses").insert({
            household_id: householdId,
            title: a.title,
            amount: a.amount,
            expense_date: a.expense_date ?? new Date().toISOString().slice(0, 10),
            notes: a.notes ?? null,
            created_by: userId,
          });
          affectedPaths.push("/finanzas");
          executed++;
          break;
        }
        case "create_subscription": {
          const a = action as CreateSubscriptionAction;
          await supabase.from("subscriptions").insert({
            household_id: householdId,
            name: a.name,
            amount: a.amount,
            billing_cycle: a.billing_cycle,
            renewal_date: a.renewal_date ?? null,
            created_by: userId,
          });
          affectedPaths.push("/finanzas");
          executed++;
          break;
        }
        case "create_fixed_payment": {
          const a = action as CreateFixedPaymentAction;
          await supabase.from("fixed_payments").insert({
            household_id: householdId,
            name: a.name,
            amount: a.amount,
            due_day: a.due_day,
            created_by: userId,
          });
          affectedPaths.push("/finanzas");
          executed++;
          break;
        }
        // suggest_recipe, suggest_meal_plan, organise_shopping_list — no DB write
        default:
          break;
      }
    } catch {
      // Log action failures silently; don't break the whole response
    }
  }

  for (const path of [...new Set(affectedPaths)]) {
    revalidatePath(path);
  }

  return executed;
}

export async function POST(req: NextRequest) {
  let auth;
  try {
    auth = await requireHousehold();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { householdId, user } = auth;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ error: "Mensaje requerido" }, { status: 400 });
  }

  const userMessage: string = body.message.trim();
  const history: { role: "user" | "assistant"; content: string }[] = Array.isArray(body.history)
    ? body.history.slice(-10)
    : [];

  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey) {
    return NextResponse.json({ error: "Asistente no configurado" }, { status: 503 });
  }

  const supabase = await createClient();
  const context = await fetchHouseholdContext(supabase, householdId);
  const today = new Date().toISOString().slice(0, 10);

  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `${buildSystemPrompt(today)}\n\nCONTEXTO DEL HOGAR:\n${JSON.stringify(context, null, 2)}`,
        },
      ],
    },
    { role: "model", parts: [{ text: '{"message":"Entendido. Estoy listo para ayudarte.","actions":[]}' }] },
    ...history.map((h) => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.content }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const geminiRes = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      }),
    },
  );

  if (!geminiRes.ok) {
    const err = await geminiRes.text();
    console.error("Gemini error:", geminiRes.status, err.slice(0, 200));
    return NextResponse.json({ error: "Error al contactar el asistente" }, { status: 502 });
  }

  const geminiData = await geminiRes.json();
  const rawText: string =
    geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{"message":"No pude procesar tu solicitud.","actions":[]}';

  let parsed: GeminiResponse;
  try {
    parsed = JSON.parse(rawText) as GeminiResponse;
    if (typeof parsed.message !== "string") throw new Error("bad shape");
    if (!Array.isArray(parsed.actions)) parsed.actions = [];
  } catch {
    parsed = { message: rawText, actions: [] };
  }

  const actionsExecuted = await executeActions(supabase, householdId, user.id, parsed.actions);

  return NextResponse.json({ message: parsed.message, actionsExecuted });
}
