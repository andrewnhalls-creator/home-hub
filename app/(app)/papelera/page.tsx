import { Trash2 } from "lucide-react";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TrashSection } from "@/components/ui/TrashSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { restoreReminder } from "@/app/(app)/recordatorios/actions";
import { restoreDocument } from "@/app/(app)/documentos/actions";
import {
  restoreFixedPayment,
  restoreExpense,
  restoreSavingsGoal,
  restoreSubscription,
} from "@/app/(app)/finanzas/actions";
import { restoreShoppingList } from "@/app/(app)/compra/listas/actions";

export default async function PapeleraPage() {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const [
    { data: reminders },
    { data: docs },
    { data: payments },
    { data: expenses },
    { data: savings },
    { data: subs },
    { data: lists },
  ] = await Promise.all([
    supabase
      .from("reminders")
      .select("id, title, deleted_at")
      .eq("household_id", householdId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(50),
    supabase
      .from("household_documents")
      .select("id, title, deleted_at")
      .eq("household_id", householdId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(50),
    supabase
      .from("fixed_payments")
      .select("id, name, deleted_at")
      .eq("household_id", householdId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(50),
    supabase
      .from("expenses")
      .select("id, title, deleted_at")
      .eq("household_id", householdId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(50),
    supabase
      .from("savings_goals")
      .select("id, name, deleted_at")
      .eq("household_id", householdId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(50),
    supabase
      .from("subscriptions")
      .select("id, name, deleted_at")
      .eq("household_id", householdId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(50),
    supabase
      .from("shopping_lists")
      .select("id, name, deleted_at")
      .eq("household_id", householdId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false })
      .limit(50),
  ]);

  const sections = [
    {
      title: "Recordatorios",
      items: (reminders ?? []).map((r) => ({ id: r.id, label: r.title, deletedAt: r.deleted_at! })),
      restoreAction: restoreReminder,
    },
    {
      title: "Documentos",
      items: (docs ?? []).map((r) => ({ id: r.id, label: r.title, deletedAt: r.deleted_at! })),
      restoreAction: restoreDocument,
    },
    {
      title: "Pagos fijos",
      items: (payments ?? []).map((r) => ({ id: r.id, label: r.name, deletedAt: r.deleted_at! })),
      restoreAction: restoreFixedPayment,
    },
    {
      title: "Gastos",
      items: (expenses ?? []).map((r) => ({ id: r.id, label: r.title, deletedAt: r.deleted_at! })),
      restoreAction: restoreExpense,
    },
    {
      title: "Metas de ahorro",
      items: (savings ?? []).map((r) => ({ id: r.id, label: r.name, deletedAt: r.deleted_at! })),
      restoreAction: restoreSavingsGoal,
    },
    {
      title: "Suscripciones",
      items: (subs ?? []).map((r) => ({ id: r.id, label: r.name, deletedAt: r.deleted_at! })),
      restoreAction: restoreSubscription,
    },
    {
      title: "Listas de la compra",
      items: (lists ?? []).map((r) => ({ id: r.id, label: r.name, deletedAt: r.deleted_at! })),
      restoreAction: restoreShoppingList,
    },
  ].filter((s) => s.items.length > 0);

  const isEmpty = sections.length === 0;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted">
        Elementos eliminados recientemente. Puedes restaurarlos en cualquier momento.
      </p>

      {isEmpty ? (
        <div className="mt-6">
          <EmptyState
            icon={Trash2}
            title="La papelera está vacía."
            description="Los elementos eliminados aparecerán aquí."
          />
        </div>
      ) : (
        sections.map((s) => (
          <TrashSection
            key={s.title}
            title={s.title}
            items={s.items}
            restoreAction={s.restoreAction}
          />
        ))
      )}
    </div>
  );
}
