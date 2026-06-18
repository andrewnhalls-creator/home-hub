import {
  ShoppingCart,
  UtensilsCrossed,
  Bell,
  ListChecks,
  CalendarDays,
  Wallet,
} from "lucide-react";
import { startOfWeek, endOfWeek, format, isPast, addDays } from "date-fns";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/format";
import { MetricCard } from "@/components/ui/MetricCard";
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
  const in7Days = format(addDays(today, 7), "yyyy-MM-dd");

  const [
    { count: shoppingCount },
    { count: weekMealsCount },
    { data: reminders, count: remindersCount },
    { data: chores, count: choresCount },
    { data: payments, count: paymentsCount },
    { data: subscriptions },
    { data: calendarEvents },
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
      .select("id, name, amount, due_day", { count: "exact" })
      .eq("household_id", householdId)
      .eq("is_active", true)
      .order("due_day", { ascending: true, nullsFirst: false })
      .limit(3),
    supabase
      .from("subscriptions")
      .select("id, name, amount, renewal_date")
      .eq("household_id", householdId)
      .eq("is_active", true)
      .gte("renewal_date", todayStr)
      .lte("renewal_date", in7Days)
      .order("renewal_date", { ascending: true })
      .limit(3),
    supabase
      .from("calendar_events")
      .select("id, title, event_date")
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .gte("event_date", weekStart)
      .lte("event_date", weekEnd)
      .order("event_date", { ascending: true }),
  ]);

  const firstName = (user.user_metadata?.display_name as string | undefined)?.split(" ")[0];
  const pendingCount = (remindersCount ?? 0) + (choresCount ?? 0);
  const todayEventsCount = (calendarEvents ?? []).filter((e) => e.event_date === todayStr).length;
  const shopping = shoppingCount ?? 0;
  const meals = weekMealsCount ?? 0;
  const pending = remindersCount ?? 0;
  const tasks = choresCount ?? 0;
  const activePayments = paymentsCount ?? 0;

  const hasOverdueReminders = (reminders ?? []).some((r) => r.due_at && isPast(new Date(r.due_at)));
  const dayOfMonth = today.getDate();
  const hasOverduePayments = (payments ?? []).some((p) => p.due_day < dayOfMonth);

  return (
    <div className="flex flex-col gap-5">
      {/* Greeting — always full width */}
      <GreetingCard
        firstName={firstName}
        householdName={householdName}
        pendingCount={pendingCount}
      />

      {/* On lg+: 2-col layout (metric grid left, calendar + lists right) */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Left: 6 metric tiles — 2-col on mobile/tablet, 3-col on md+ */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2 lg:content-start">
          <MetricCard
            icon={ShoppingCart}
            label="Compra"
            metric={shopping}
            status={shopping === 0 ? "Lista vacía" : "pendientes"}
            href="/compra"
          />
          <MetricCard
            icon={UtensilsCrossed}
            iconColor="text-olive"
            iconBg="bg-sage/20"
            label="Menú"
            metric={meals}
            status={meals === 0 ? "Sin planificar" : "de 7 comidas"}
            href="/menu"
          />
          <MetricCard
            icon={Bell}
            iconBg="bg-amber/20"
            label="Recordatorios"
            metric={pending}
            status={pending === 0 ? "Nada pendiente" : "pendientes"}
            attention={hasOverdueReminders}
            href="/recordatorios"
          />
          <MetricCard
            icon={ListChecks}
            iconColor="text-olive"
            iconBg="bg-olive/10"
            label="Tareas"
            metric={tasks}
            status={tasks === 0 ? "Al día" : "pendientes"}
            href="/tareas"
          />
          <MetricCard
            icon={CalendarDays}
            label="Hoy"
            metric={todayEventsCount}
            status={todayEventsCount === 0 ? "Sin eventos hoy" : "eventos"}
            href="/calendario"
          />
          <MetricCard
            icon={Wallet}
            iconColor="text-coral"
            iconBg="bg-rose/20"
            label="Finanzas"
            metric={activePayments}
            status={activePayments === 0 ? "Sin pagos activos" : "pagos activos"}
            attention={hasOverduePayments}
            href="/finanzas"
          />
        </div>

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

          {(payments?.length ?? 0) > 0 && (
            <ListSection
              title="Próximos pagos"
              href="/finanzas"
              items={(payments ?? []).map((p) => ({
                id: p.id,
                title: p.name,
                meta: p.due_day ? `Día ${p.due_day}` : undefined,
                badgeLabel: formatCurrency(p.amount),
                badgeVariant: "accent" as const,
              }))}
            />
          )}

          {subscriptions && subscriptions.length > 0 && (
            <ListSection
              title="Suscripciones esta semana"
              href="/finanzas"
              items={subscriptions.map((s) => ({
                id: s.id,
                title: s.name,
                meta: s.renewal_date ? formatDate(s.renewal_date) : undefined,
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
