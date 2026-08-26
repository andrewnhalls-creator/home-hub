import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireHousehold } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = [...new Set(rows.flatMap((r) => Object.keys(r)))];
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const v = row[h];
          if (v === null || v === undefined) return "";
          const s = String(v).replace(/"/g, '""');
          return /[",\n]/.test(s) ? `"${s}"` : s;
        })
        .join(","),
    ),
  ];
  return lines.join("\n");
}

// Full-household export (JSON) / finance export (CSV). Owner-only per spec.
// Includes product data only: no auth internals, push subscriptions/keys,
// tokens, or operational logs. The dataset is small enough that the export
// completes synchronously (documented deviation from the async-job model).
export async function GET(req: NextRequest) {
  let auth;
  try {
    auth = await requireHousehold();
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { householdId, role, user } = auth;
  if (!checkRateLimit(`export:${user.id}`, 5, 60_000)) {
    return NextResponse.json(
      { error: "Demasiadas exportaciones seguidas. Espera un momento." },
      { status: 429 },
    );
  }
  if (role !== "owner") {
    return NextResponse.json(
      { error: "Solo la persona propietaria del hogar puede exportar los datos." },
      { status: 403 },
    );
  }

  const supabase = await createClient();
  const format = req.nextUrl.searchParams.get("formato") ?? "json";

  const [
    { data: household },
    { data: members },
    { data: shoppingItems },
    { data: expenses },
    { data: fixedPayments },
    { data: savingsGoals },
    { data: contributions },
    { data: documents },
    { data: reminders },
    { data: chores },
    { data: calendarEvents },
    { data: wishlistItems },
    { data: shoppingLists },
    { data: subscriptions },
    { data: ledger },
  ] = await Promise.all([
    supabase.from("households").select("id, name, locale, currency, monthly_budget, current_balance, created_at").eq("id", householdId).single(),
    supabase.from("household_members").select("user_id, role, display_name, created_at").eq("household_id", householdId),
    supabase.from("shopping_items").select("name, quantity, unit, store, priority, notes, is_completed, completed_at, created_at").eq("household_id", householdId),
    supabase.from("expenses").select("title, amount, currency, expense_date, category_id, notes, created_at").eq("household_id", householdId).is("deleted_at", null),
    supabase.from("fixed_payments").select("name, amount, currency, due_day, payment_method, is_active, notes, created_at").eq("household_id", householdId).is("deleted_at", null),
    supabase.from("savings_goals").select("name, target_amount, current_amount, target_date, notes, created_at").eq("household_id", householdId).is("deleted_at", null),
    supabase.from("savings_contributions").select("goal_id, amount, contribution_date, notes, created_at"),
    supabase.from("household_documents").select("title, document_type, provider, expiry_date, renewal_date, notes, created_at").eq("household_id", householdId).is("deleted_at", null),
    supabase.from("reminders").select("title, description, due_at, repeat_frequency, status, created_at").eq("household_id", householdId).is("deleted_at", null),
    supabase.from("chores").select("title, description, frequency, next_due_date, status, created_at").eq("household_id", householdId),
    supabase.from("calendar_events").select("title, event_date, end_date, event_time, is_all_day, repeat_frequency, notes, created_at").eq("household_id", householdId).is("deleted_at", null).eq("is_private", false),
    supabase.from("wishlist_items").select("name, estimated_cost, priority, target_month, url, status, notes, created_at").eq("household_id", householdId),
    supabase.from("shopping_lists").select("name, week_start_date, week_end_date, planned_budget, actual_total, status, shopping_date, created_at").eq("household_id", householdId).is("deleted_at", null),
    supabase.from("subscriptions").select("name, amount, billing_day, is_active, notes, created_at").eq("household_id", householdId).is("deleted_at", null),
    supabase.from("ledger_entries").select("entry_type, occurred_on, amount, principal_amount, description, created_at").eq("household_id", householdId).is("deleted_at", null),
  ]);

  if (format === "json") {
    const payload = {
      exportado_el: new Date().toISOString(),
      hogar: household,
      miembros: members ?? [],
      lista_compra: shoppingItems ?? [],
      listas_compra: shoppingLists ?? [],
      gastos: expenses ?? [],
      pagos_fijos: fixedPayments ?? [],
      metas_ahorro: savingsGoals ?? [],
      aportaciones_ahorro: contributions ?? [],
      suscripciones: subscriptions ?? [],
      movimientos: ledger ?? [],
      documentos: documents ?? [],
      recordatorios: reminders ?? [],
      tareas: chores ?? [],
      calendario: calendarEvents ?? [],
      deseos: wishlistItems ?? [],
    };

    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="home-hub-export-${new Date().toISOString().slice(0, 10)}.json"`,
      },
    });
  }

  // CSV: the canonical ledger is the finance export.
  const csv = toCSV((ledger ?? []) as Record<string, unknown>[]);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="home-hub-finanzas-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
