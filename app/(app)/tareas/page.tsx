import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ChoreList } from "@/components/chores/ChoreList";

export default async function ChoresPage() {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const [{ data: chores }, { data: members }] = await Promise.all([
    supabase
      .from("chores")
      .select("*")
      .eq("household_id", householdId)
      .order("next_due_date", { ascending: true, nullsFirst: false }),
    supabase.from("household_members").select("user_id, display_name").eq("household_id", householdId),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-brown">Tareas</h1>
        <p className="mt-1 text-sm text-muted">Las tareas de casa, repartidas y al día.</p>
      </div>
      <ChoreList chores={chores ?? []} members={members ?? []} />
    </div>
  );
}
