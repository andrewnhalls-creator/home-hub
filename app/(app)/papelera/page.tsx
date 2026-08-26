import { Trash } from "@phosphor-icons/react/dist/ssr";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { TrashSection } from "@/components/ui/TrashSection";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyTrashButton } from "@/components/ui/EmptyTrashButton";
import { restoreReminder } from "@/app/(app)/recordatorios/actions";
import { restoreDocument } from "@/app/(app)/documentos/actions";
import {
  restoreFixedPayment,
  restoreExpense,
  restoreSavingsGoal,
  restoreSubscription,
} from "@/app/(app)/finanzas/actions";
import { restoreShoppingList } from "@/app/(app)/compra/listas/actions";
import { restoreCalendarEvent } from "@/app/(app)/calendario/actions";

export default async function PapeleraPage() {
  const { householdId, role } = await requireHousehold();
  const supabase = await createClient();

  const [
    { data: reminders },
    { data: docs },
    { data: payments },
    { data: expenses },
    { data: savings },
    { data: subs },
    { data: lists },
    { data: events },
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
    supabase
      .from("calendar_events")
      .select("id, title, deleted_at")
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
    {
      title: "Eventos del calendario",
      items: (events ?? []).map((r) => ({ id: r.id, label: r.title, deletedAt: r.deleted_at! })),
      restoreAction: restoreCalendarEvent,
    },
  ].filter((s) => s.items.length > 0);

  const isEmpty = sections.length === 0;

  return (
    <div className="flex flex-col gap-2">
      <div>
        <h1 className="text-2xl font-bold text-brown">Papelera</h1>
        <p className="mt-1 text-sm text-muted">
          Elementos eliminados recientemente. Puedes restaurarlos en cualquier momento.
        </p>
      </div>

      {isEmpty ? (
        <div className="mt-6">
          <EmptyState
            icon={Trash}
            title="La papelera está vacía."
            description="Los elementos eliminados aparecerán aquí."
          />
        </div>
      ) : (
        <>
          {sections.map((s) => (
            <TrashSection
              key={s.title}
              title={s.title}
              items={s.items}
              restoreAction={s.restoreAction}
            />
          ))}
          {role === "owner" && (
            <div className="mt-4">
              <EmptyTrashButton />
            </div>
          )}
        </>
      )}
    </div>
  );
}
