import { ShoppingCart, UtensilsCrossed } from "lucide-react";
import { startOfWeek, endOfWeek, format, isPast } from "date-fns";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/format";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { ListSection } from "@/components/dashboard/ListSection";
import { RecentActivity } from "@/components/dashboard/RecentActivity";

export default async function DashboardPage() {
  const { user, householdId, householdName } = await requireHousehold();
  const supabase = await createClient();

  const today = new Date();
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const todayStr = format(today, "yyyy-MM-dd");
  const in30Days = format(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000), "yyyy-MM-dd");

  const [
    { count: shoppingCount },
    { count: weekMealsCount },
    { data: reminders },
    { data: chores },
    { data: payments },
    { data: savingsGoals },
    { data: subscriptions },
    { data: activity },
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
      .select("id, title, due_at, status")
      .eq("household_id", householdId)
      .eq("status", "pendiente")
      .order("due_at", { ascending: true, nullsFirst: false })
      .limit(3),
    supabase
      .from("chores")
      .select("id, title, next_due_date, status")
      .eq("household_id", householdId)
      .eq("status", "pendiente")
      .order("next_due_date", { ascending: true, nullsFirst: false })
      .limit(3),
    supabase
      .from("fixed_payments")
      .select("id, name, amount, due_day")
      .eq("household_id", householdId)
      .eq("is_active", true)
      .order("due_day", { ascending: true, nullsFirst: false })
      .limit(3),
    supabase
      .from("savings_goals")
      .select("id, name, target_amount, current_amount")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true })
      .limit(1),
    supabase
      .from("subscriptions")
      .select("id, name, amount, renewal_date")
      .eq("household_id", householdId)
      .eq("is_active", true)
      .gte("renewal_date", todayStr)
      .lte("renewal_date", in30Days)
      .order("renewal_date", { ascending: true })
      .limit(3),
    supabase
      .from("activity_log")
      .select("id, summary, created_at")
      .eq("household_id", householdId)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const firstName = (user.user_metadata?.display_name as string | undefined)?.split(" ")[0];
  const topGoal = savingsGoals?.[0];

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardTitle>{firstName ? `Hola, ${firstName}` : "Hola"}</CardTitle>
        <CardDescription>Resumen de {householdName}</CardDescription>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          icon={ShoppingCart}
          label="En la lista de la compra"
          value={String(shoppingCount ?? 0)}
          href="/compra"
        />
        <SummaryCard
          icon={UtensilsCrossed}
          label="Comidas esta semana"
          value={String(weekMealsCount ?? 0)}
          href="/menu"
        />
      </div>

      <ListSection
        title="Próximos recordatorios"
        href="/recordatorios"
        emptyMessage="Nada pendiente por ahora."
        items={(reminders ?? []).map((reminder) => ({
          id: reminder.id,
          title: reminder.title,
          meta: reminder.due_at ? formatDate(reminder.due_at) : undefined,
          badgeLabel: reminder.due_at && isPast(new Date(reminder.due_at)) ? "Vencido" : "Pendiente",
          badgeVariant: reminder.due_at && isPast(new Date(reminder.due_at)) ? "danger" : "neutral",
        }))}
      />

      <ListSection
        title="Tareas de casa pendientes"
        href="/tareas"
        emptyMessage="Tu semana está lista."
        items={(chores ?? []).map((chore) => ({
          id: chore.id,
          title: chore.title,
          meta: chore.next_due_date ? formatDate(chore.next_due_date) : undefined,
        }))}
      />

      <ListSection
        title="Próximos pagos"
        href="/finanzas"
        emptyMessage="Todavía no hay pagos fijos configurados."
        items={(payments ?? []).map((payment) => ({
          id: payment.id,
          title: payment.name,
          meta: payment.due_day ? `Día ${payment.due_day}` : undefined,
          badgeLabel: formatCurrency(payment.amount),
          badgeVariant: "accent",
        }))}
      />

      <Card>
        <CardTitle>Objetivos de ahorro</CardTitle>
        {topGoal ? (
          <div className="mt-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-brown">{topGoal.name}</span>
              <span className="text-muted">
                {formatCurrency(topGoal.current_amount)} / {formatCurrency(topGoal.target_amount)}
              </span>
            </div>
            <ProgressBar
              className="mt-2"
              value={topGoal.current_amount}
              max={topGoal.target_amount}
              label={topGoal.name}
            />
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted">
            Todavía no hay objetivos de ahorro. Crea el primero para empezar.
          </p>
        )}
      </Card>

      {subscriptions && subscriptions.length > 0 && (
        <ListSection
          title="Suscripciones que se renuevan pronto"
          href="/finanzas"
          emptyMessage=""
          items={subscriptions.map((subscription) => ({
            id: subscription.id,
            title: subscription.name,
            meta: subscription.renewal_date ? formatDate(subscription.renewal_date) : undefined,
            badgeLabel: formatCurrency(subscription.amount),
            badgeVariant: "warning",
          }))}
        />
      )}

      <RecentActivity items={activity ?? []} />
    </div>
  );
}
