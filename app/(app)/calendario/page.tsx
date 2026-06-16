import { addDays } from "date-fns";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildCalendarItems } from "@/lib/calendar";
import { CalendarView } from "@/components/calendar/CalendarView";

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

  return <CalendarView items={items} />;
}
