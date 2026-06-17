import { addDays } from "date-fns";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildCalendarItems } from "@/lib/calendar";
import { CalendarView } from "@/components/calendar/CalendarView";
import { TrashSection } from "@/components/ui/TrashSection";
import { restoreCalendarEvent } from "./actions";

export default async function CalendarPage() {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const [
    { data: events },
    { data: reminders },
    { data: chores },
    { data: paymentInstances },
    { data: subscriptions },
    { data: documents },
    { data: meals },
    { data: deletedEvents },
  ] = await Promise.all([
    supabase.from("calendar_events").select("*").eq("household_id", householdId).is("deleted_at", null),
    supabase
      .from("reminders")
      .select("id, title, due_at")
      .eq("household_id", householdId)
      .eq("status", "pendiente")
      .is("deleted_at", null)
      .not("due_at", "is", null),
    supabase
      .from("chores")
      .select("id, title, next_due_date")
      .eq("household_id", householdId)
      .eq("status", "pendiente")
      .not("next_due_date", "is", null),
    supabase
      .from("payment_instances")
      .select("id, due_date, fixed_payments(name)")
      .eq("household_id", householdId),
    supabase
      .from("subscriptions")
      .select("id, name, renewal_date")
      .eq("household_id", householdId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .not("renewal_date", "is", null),
    supabase
      .from("household_documents")
      .select("id, title, expiry_date")
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .not("expiry_date", "is", null),
    supabase
      .from("meal_plans")
      .select("id, planned_date, custom_name, recipes(name)")
      .eq("household_id", householdId),
    supabase
      .from("calendar_events")
      .select("id, title, event_date, deleted_at")
      .eq("household_id", householdId)
      .not("deleted_at", "is", null)
      .order("deleted_at", { ascending: false }),
  ]);

  const today = new Date();
  const items = buildCalendarItems({
    events: events ?? [],
    reminders: reminders ?? [],
    chores: chores ?? [],
    paymentInstances: paymentInstances ?? [],
    subscriptions: subscriptions ?? [],
    documents: documents ?? [],
    meals: meals ?? [],
    rangeStart: addDays(today, -365),
    rangeEnd: addDays(today, 365),
  });

  const trashItems = (deletedEvents ?? []).map((e) => ({
    id: e.id,
    label: e.title,
    sublabel: e.event_date
      ? new Date(e.event_date).toLocaleDateString("es-ES")
      : undefined,
    deletedAt: e.deleted_at as string,
  }));

  return (
    <>
      <CalendarView items={items} />
      <div className="px-4 pb-6 max-w-2xl mx-auto">
        <TrashSection
          title="Papelera del calendario"
          items={trashItems}
          restoreAction={restoreCalendarEvent}
          emptyMessage="No hay eventos eliminados"
        />
      </div>
    </>
  );
}
