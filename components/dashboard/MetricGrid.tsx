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
  activePayments: number;
  hasOverdueReminders: boolean;
  hasOverduePayments: boolean;
}

export function MetricGrid({
  shopping,
  meals,
  pending,
  tasks,
  todayEventsCount,
  activePayments,
  hasOverdueReminders,
  hasOverduePayments,
}: MetricGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-2 lg:content-start">
      <MetricCard
        icon={ShoppingCart}
        label="Compra"
        metric={shopping}
        status={shopping === 0 ? "Lista vacía" : "pendientes"}
        href="/compra"
      />
      <MetricCard
        icon={ForkKnife}
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
        icon={CalendarDots}
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
  );
}
