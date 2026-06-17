import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
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

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { data: membership } = await supabase
    .from("household_members")
    .select("household_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const householdId = membership.household_id as string;
  const format = req.nextUrl.searchParams.get("formato") ?? "json";

  const [
    { data: household },
    { data: members },
    { data: shoppingItems },
    { data: expenses },
    { data: fixedPayments },
    { data: savingsGoals },
    { data: documents },
    { data: reminders },
    { data: chores },
    { data: calendarEvents },
    { data: wishlistItems },
    { data: shoppingLists },
  ] = await Promise.all([
    supabase.from("households").select("id, name, locale, currency, created_at").eq("id", householdId).single(),
    supabase.from("household_members").select("user_id, role, display_name, created_at").eq("household_id", householdId),
    supabase.from("shopping_items").select("name, quantity, unit, store, priority, notes, is_completed, completed_at, created_at").eq("household_id", householdId).is("deleted_at", null),
    supabase.from("expenses").select("amount, category_id, description, date, notes, created_at").eq("household_id", householdId).is("deleted_at", null),
    supabase.from("fixed_payments").select("name, amount, frequency, due_day, category, notes, created_at").eq("household_id", householdId).is("deleted_at", null),
    supabase.from("savings_goals").select("name, target_amount, current_amount, target_date, notes, created_at").eq("household_id", householdId).is("deleted_at", null),
    supabase.from("household_documents").select("name, type, expiry_date, renewal_notes, issued_by, created_at").eq("household_id", householdId).is("deleted_at", null),
    supabase.from("reminders").select("title, due_date, due_time, category, assigned_to, frequency, status, created_at").eq("household_id", householdId).is("deleted_at", null),
    supabase.from("chores").select("title, frequency, next_due_date, assigned_to, notes, created_at").eq("household_id", householdId),
    supabase.from("calendar_events").select("title, date, end_date, all_day, is_private, notes, created_at").eq("household_id", householdId).eq("is_private", false),
    supabase.from("wishlist_items").select("name, description, url, price, priority, status, category, created_at").eq("household_id", householdId),
    supabase.from("shopping_lists").select("name, week_start, week_end, planned_budget, actual_total, status, created_at").eq("household_id", householdId).is("deleted_at", null),
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

  // CSV: combine finance-related tables
  const csvRows = [
    ...(expenses ?? []).map((r) => ({ tipo: "gasto", ...r })),
    ...(fixedPayments ?? []).map((r) => ({ tipo: "pago_fijo", ...r })),
    ...(savingsGoals ?? []).map((r) => ({ tipo: "meta_ahorro", ...r })),
    ...(shoppingLists ?? []).map((r) => ({ tipo: "lista_compra", ...r })),
  ] as Record<string, unknown>[];

  const csv = toCSV(csvRows);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="home-hub-finanzas-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
