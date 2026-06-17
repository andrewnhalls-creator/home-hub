import { addDays, format, startOfWeek, subWeeks } from "date-fns";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ShoppingListsOverview } from "@/components/shopping/ShoppingListsOverview";
import { TrashSection } from "@/components/ui/TrashSection";
import { restoreShoppingList, unarchiveShoppingList } from "./actions";

export default async function ShoppingListsPage() {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const [{ data: lists }, { data: trips }, { data: archived }, { data: deleted }] = await Promise.all([
    supabase
      .from("shopping_lists")
      .select("*")
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false }),
    supabase.from("shopping_trips").select("shopping_list_id, total_amount").eq("household_id", householdId),
    supabase
      .from("shopping_lists")
      .select("id, name, archived_at")
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .not("archived_at", "is", null)
      .order("archived_at", { ascending: false }),
    supabase
      .from("shopping_lists")
      .select("id, name, deleted_at")
      .eq("household_id", householdId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
  ]);

  const tripsTotalByList = new Map<string, number>();
  for (const trip of trips ?? []) {
    tripsTotalByList.set(
      trip.shopping_list_id,
      (tripsTotalByList.get(trip.shopping_list_id) ?? 0) + Number(trip.total_amount),
    );
  }

  const effectiveTotal = (list: { id: string; actual_total: number | null }) =>
    list.actual_total ?? tripsTotalByList.get(list.id) ?? 0;

  const today = new Date();
  const currentWeekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const currentWeekEnd = format(addDays(startOfWeek(today, { weekStartsOn: 1 }), 6), "yyyy-MM-dd");
  const prevWeekStart = format(subWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1), "yyyy-MM-dd");
  const prevWeekEnd = format(addDays(subWeeks(startOfWeek(today, { weekStartsOn: 1 }), 1), 6), "yyyy-MM-dd");
  const monthStr = format(today, "yyyy-MM");

  const purchasedLists = (lists ?? []).filter((list) => list.status === "comprada" && list.shopping_date);

  const currentWeekTotal = purchasedLists
    .filter((l) => l.shopping_date! >= currentWeekStart && l.shopping_date! <= currentWeekEnd)
    .reduce((sum, l) => sum + effectiveTotal(l), 0);

  const previousWeekTotal = purchasedLists
    .filter((l) => l.shopping_date! >= prevWeekStart && l.shopping_date! <= prevWeekEnd)
    .reduce((sum, l) => sum + effectiveTotal(l), 0);

  const monthlyTotal = purchasedLists
    .filter((l) => l.shopping_date!.startsWith(monthStr))
    .reduce((sum, l) => sum + effectiveTotal(l), 0);

  const last4WeeksStart = format(subWeeks(startOfWeek(today, { weekStartsOn: 1 }), 4), "yyyy-MM-dd");
  const last4WeeksTotal = purchasedLists
    .filter((l) => l.shopping_date! >= last4WeeksStart && l.shopping_date! <= currentWeekEnd)
    .reduce((sum, l) => sum + effectiveTotal(l), 0);
  const fourWeekAverage = last4WeeksTotal / 4;

  const archiveItems = (archived ?? []).map((l) => ({
    id: l.id,
    label: l.name,
    deletedAt: l.archived_at as string,
  }));

  const trashItems = (deleted ?? []).map((l) => ({
    id: l.id,
    label: l.name,
    deletedAt: l.deleted_at as string,
  }));

  return (
    <>
      <ShoppingListsOverview
        lists={lists ?? []}
        analytics={{ currentWeekTotal, previousWeekTotal, monthlyTotal, fourWeekAverage }}
      />
      <div className="pb-6">
        <TrashSection
          title="Listas archivadas"
          items={archiveItems}
          restoreAction={unarchiveShoppingList}
          emptyMessage="No hay listas archivadas"
        />
        <TrashSection
          title="Papelera de listas"
          items={trashItems}
          restoreAction={restoreShoppingList}
          emptyMessage="No hay listas eliminadas"
        />
      </div>
    </>
  );
}
