import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReminderList } from "@/components/reminders/ReminderList";

export default async function RemindersPage() {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const [{ data: reminders }, { data: categories }, { data: members }] = await Promise.all([
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
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-brown">Recordatorios</h1>
        <p className="mt-1 text-sm text-muted">Gestiona las cosas de tu hogar con calma.</p>
      </div>
      <ReminderList reminders={reminders ?? []} categories={categories ?? []} members={members ?? []} />
    </div>
  );
}
