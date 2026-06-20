import { MetricGrid } from "@/components/dashboard/MetricGrid";
import { Card } from "@/components/ui/Card";
import { ForkKnife, CalendarDots, WarningCircle } from "@phosphor-icons/react/dist/ssr";
import { startOfWeek, endOfWeek, format, isPast, parseISO } from "date-fns";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getCurrentCycleDates, getSubscriptionCycleStatus } from "@/lib/cycle";
import { formatCurrency, formatDate } from "@/lib/format";
import { GreetingCard } from "@/components/dashboard/GreetingCard";
import { WeekCalendarWidget } from "@/components/dashboard/WeekCalendarWidget";
import { ListSection } from "@/components/dashboard/ListSection";

export default async function DashboardPage() {
  const { user, householdId, householdName } = await requireHousehold();
  const supabase = await createClient();

  const today = new Date();
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const todayStr = format(today, "yyyy-MM-dd");
  const { start: cycleStartDate, end: cycleEndDate } = getCurrentCycleDates();
  const cycleStart = format(cycleStartDate, "yyyy-MM-dd");
  const cycleEnd = format(cycleEndDate, "yyyy-MM-dd");

  const [
    { count: shoppingCount },
    { count: weekMealsCount },
    { data: reminders, count: remindersCount },
    { data: chores, count: choresCount },
    { data: allFixedPayments },
    { data: cycleInstances },
    { data: subscriptions },
    { data: calendarEvents },
    { data: todayMeals },
  ] = await Promise.all([
    supabase
      .from("shopping_items")
      .select("id", { count: "exact", head: true })
      .eq("household_id", householdId)
      .eq("is_completed", false),
    supabase
      .from("meal_plans")
      .select("id", { count: "exact", head: true })
      .eq("household_id", householdId)
      .gte("planned_date", weekStart)
      .lte("planned_date", weekEnd),
    supabase
      .from("reminders")
      .select("id, title, due_at, status", { count: "exact" })
      .eq("household_id", householdId)
      .eq("status", "pendiente")
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(3),
    supabase
      .from("chores")
      .select("id, title, next_due_date, status", { count: "exact" })
      .eq("household_id", householdId)
      .eq("status", "pendiente")
      .order("next_due_date", { ascending: true, nullsFirst: false })
      .limit(3),
    supabase
      .from("fixed_payments")
      .select("id, name, amount, due_day")
      .eq("household_id", householdId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .order("due_day", { ascending: true, nullsFirst: false }),
    supabase
      .from("payment_instances")
      .select("fixed_payment_id, status")
      .eq("household_id", householdId)
      .gte("due_date", cycleStart)
      .lte("due_date", cycleEnd),
    supabase
      .from("subscriptions")
      .select("id, name, amount, billing_day, billing_cycle, start_date, renewal_date")
      .eq("household_id", householdId)
      .eq("is_active", true)
      .is("deleted_at", null)
      .limit(100),
    supabase
      .from("calendar_events")
      .select("id, title, event_date")
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .gte("event_date", weekStart)
      .lte("event_date", weekEnd)
      .order("event_date", { ascending: true }),
    supabase
      .from("meal_plans")
      .select("id, meal_type, custom_name, recipes(name)")
      .eq("household_id", householdId)
      .eq("planned_date", todayStr)
      .in("meal_type", ["comida", "cena"])
      .order("meal_type", { ascending: true }),
  ]);

  const firstName = (user.user_metadata?.display_name as string | undefined)?.split(" ")[0];
  const pendingCount = (remindersCount ?? 0) + (choresCount ?? 0);
  const todayEventsCount = (calendarEvents ?? []).filter((e) => e.event_date === todayStr).length;
  const shopping = shoppingCount ?? 0;
  const meals = weekMealsCount ?? 0;
  const pending = remindersCount ?? 0;
  const tasks = choresCount ?? 0;

  const hasOverdueReminders = (reminders ?? []).some((r) => r.due_at && isPast(new Date(r.due_at)));
  const instanceMap = new Map((cycleInstances ?? []).map((i) => [i.fixed_payment_id, i]));
  const pendingFixedPayments = (allFixedPayments ?? []).filter((p) => {
    const inst = instanceMap.get(p.id);
    if (inst?.status === "pagado" || inst?.status === "omitido") return false;
    if (p.due_day != null) return getSubscriptionCycleStatus(p.due_day, today) === "pendiente";
    return true;
  });
  const pendingSubscriptions = (subscriptions ?? []).filter((s) => {
    if (s.start_date && parseISO(s.start_date) > today) return false;
    if (s.billing_cycle === "mensual" && s.billing_day != null) {
      return getSubscriptionCycleStatus(s.billing_day, today) === "pendiente";
    }
    // Non-monthly (annual, quarterly): show if renewal_date falls within this cycle
    return s.billing_cycle !== "mensual" && !!s.renewal_date &&
      s.renewal_date >= todayStr && s.renewal_date <= cycleEnd;
  });
  const proximosCount = pendingFixedPayments.length + pendingSubscriptions.length;
  const hasOverduePayments = (cycleInstances ?? []).some((i) => i.status === "vencido");

  const todayEvents = (calendarEvents ?? []).filter((e) => e.event_date === todayStr).slice(0, 2);
  const overdueToday = (reminders ?? []).filter((r) => r.due_at && isPast(new Date(r.due_at))).slice(0, 2);
  const mealItems = (todayMeals ?? []).map((m) => {
    const r = m.recipes as unknown;
    const recipeName = Array.isArray(r) ? (r[0]?.name ?? null) : ((r as { name: string } | null)?.name ?? null);
    const displayName = m.custom_name ?? recipeName;
    const label = m.meal_type === "comida" ? "Comida" : "Cena";
    return displayName ? `${label}: ${displayName}` : null;
  }).filter((x): x is string => x !== null);
  const hasTodayBrief = mealItems.length > 0 || todayEvents.length > 0 || overdueToday.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting — always full width */}
      <GreetingCard
        firstName={firstName}
        householdName={householdName}
        pendingCount={pendingCount}
      />

      {/* Hoy — only when there's something to show */}
      {hasTodayBrief && (
        <Card>
          <p className="mb-3 text-xs font-medium text-muted">Hoy</p>
          <ul className="flex flex-col gap-2">
            {mealItems.map((label) => (
              <li key={label} className="flex items-center gap-2 text-sm text-brown">
                <ForkKnife weight="light" className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
                {label}
              </li>
            ))}
            {todayEvents.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-sm text-brown">
                <CalendarDots weight="light" className="h-3.5 w-3.5 shrink-0 text-muted" aria-hidden />
                {e.title}
              </li>
            ))}
            {overdueToday.map((r) => (
              <li key={r.id} className="flex items-center gap-2 text-sm font-medium text-danger">
                <WarningCircle weight="fill" className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {r.title}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* On lg+: 2-col layout (metric grid left, calendar + lists right) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left: 6 metric tiles */}
        <MetricGrid
          shopping={shopping}
          meals={meals}
          pending={pending}
          tasks={tasks}
          todayEventsCount={todayEventsCount}
          proximosCount={proximosCount}
          hasOverdueReminders={hasOverdueReminders}
          hasOverduePayments={hasOverduePayments}
        />

        {/* Right: calendar widget + upcoming sections */}
        <div className="flex flex-col gap-5">
          <WeekCalendarWidget
            weekStartStr={weekStart}
            events={calendarEvents ?? []}
          />

          {(reminders?.length ?? 0) > 0 && (
            <ListSection
              title="Próximos recordatorios"
              href="/recordatorios"
              items={(reminders ?? []).map((r) => ({
                id: r.id,
                title: r.title,
                meta: r.due_at ? formatDate(r.due_at) : undefined,
                badgeLabel: r.due_at && isPast(new Date(r.due_at)) ? "Vencido" : undefined,
                badgeVariant: "danger" as const,
              }))}
            />
          )}

          {(chores?.length ?? 0) > 0 && (
            <ListSection
              title="Tareas de casa pendientes"
              href="/tareas"
              items={(chores ?? []).map((c) => ({
                id: c.id,
                title: c.title,
                meta: c.next_due_date ? formatDate(c.next_due_date) : undefined,
              }))}
            />
          )}

          {pendingFixedPayments.length > 0 && (
            <ListSection
              title="Próximos pagos"
              href="/finanzas"
              items={pendingFixedPayments.slice(0, 3).map((p) => ({
                id: p.id,
                title: p.name,
                meta: p.due_day ? `Día ${p.due_day}` : undefined,
                badgeLabel: formatCurrency(p.amount),
                badgeVariant: "accent" as const,
              }))}
            />
          )}

          {pendingSubscriptions.length > 0 && (
            <ListSection
              title="Suscripciones pendientes"
              href="/finanzas"
              items={pendingSubscriptions.slice(0, 3).map((s) => ({
                id: s.id,
                title: s.name,
                meta: s.billing_cycle === "mensual" && s.billing_day
                  ? `Día ${s.billing_day}`
                  : s.renewal_date ? formatDate(s.renewal_date) : undefined,
                badgeLabel: formatCurrency(s.amount),
                badgeVariant: "warning" as const,
              }))}
            />
          )}
        </div>
      </div>
    </div>
  );
}
