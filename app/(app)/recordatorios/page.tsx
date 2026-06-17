import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReminderList } from "@/components/reminders/ReminderList";
import { TrashSection } from "@/components/ui/TrashSection";
import { restoreReminder } from "./actions";

export default async function RemindersPage() {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const [{ data: reminders }, { data: categories }, { data: members }, { data: deleted }] =
    await Promise.all([
      supabase
        .from("reminders")
        .select("*")
        .eq("household_id", householdId)
        .is("deleted_at", null)
        .order("due_at", { ascending: true, nullsFirst: false }),
      supabase
        .from("categories")
        .select("*")
        .eq("household_id", householdId)
        .eq("module", "reminders")
        .order("name", { ascending: true }),
      supabase.from("household_members").select("user_id, display_name").eq("household_id", householdId),
      supabase
        .from("reminders")
        .select("id, title, due_at, deleted_at")
        .eq("household_id", householdId)
        .not("deleted_at", "is", null)
        .order("deleted_at", { ascending: false }),
    ]);

  const trashItems = (deleted ?? []).map((r) => ({
    id: r.id,
    label: r.title,
    sublabel: r.due_at
      ? new Date(r.due_at).toLocaleDateString("es-ES")
      : undefined,
    deletedAt: r.deleted_at as string,
  }));

  return (
    <>
      <ReminderList reminders={reminders ?? []} categories={categories ?? []} members={members ?? []} />
      <div className="pb-6">
        <TrashSection
          title="Papelera de recordatorios"
          items={trashItems}
          restoreAction={restoreReminder}
          emptyMessage="No hay recordatorios eliminados"
        />
      </div>
    </>
  );
}
