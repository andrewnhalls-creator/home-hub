"use client";

import {
  ShoppingCart,
  ForkKnife,
  Bell,
  ListChecks,
  CalendarDots,
  Wallet,
} from "@phosphor-icons/react";
import { MetricCard } from "@/components/ui/MetricCard";

interface MetricGridProps {
  shopping: number;
  meals: number;
  pending: number;
  tasks: number;
  todayEventsCount: number;
  proximosCount: number;
  hasOverdueReminders: boolean;
  hasOverduePayments: boolean;
}

export function MetricGrid({
  shopping,
  meals,
  pending,
  tasks,
  todayEventsCount,
  proximosCount,
  hasOverdueReminders,
  hasOverduePayments,
}: MetricGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2 lg:content-start">
      <MetricCard
        icon={Wallet}
        iconColor="text-rose"
        iconBg="bg-rose/15"
        label="Finanzas"
        metric={proximosCount}
        status={proximosCount === 0 ? "Al corriente" : "próximos pagos"}
        attention={hasOverduePayments}
        href="/finanzas"
      />
      <MetricCard
        icon={CalendarDots}
        label="Calendario"
        metric={todayEventsCount}
        status={todayEventsCount === 0 ? "Día tranquilo" : "eventos hoy"}
        href="/calendario"
      />
      <MetricCard
        icon={ShoppingCart}
        label="Compra"
        metric={shopping}
        status={shopping === 0 ? "Lista, al día" : "pendientes"}
        href="/compra"
      />
      <MetricCard
        icon={ForkKnife}
        iconColor="text-sage"
        iconBg="bg-sage/15"
        label="Menú"
        metric={meals}
        status={meals === 0 ? "Semana por planear" : "de 7 planificadas"}
        href="/menu"
      />
      <MetricCard
        icon={Bell}
        iconColor="text-amber"
        iconBg="bg-amber/15"
        label="Recordatorios"
        metric={pending}
        status={pending === 0 ? "Todo en orden" : "pendientes"}
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
    </div>
  );
}
