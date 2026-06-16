"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Receipt } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, formatDate } from "@/lib/format";
import { ShoppingListForm } from "@/components/shopping/ShoppingListForm";
import type { ShoppingList, ShoppingListStatus } from "@/lib/types";

interface ShoppingListsOverviewProps {
  lists: ShoppingList[];
  analytics: {
    currentWeekTotal: number;
    previousWeekTotal: number;
    monthlyTotal: number;
    fourWeekAverage: number;
  };
}

const STATUS_BADGE: Record<ShoppingListStatus, "neutral" | "success" | "warning"> = {
  borrador: "neutral",
  activa: "neutral",
  comprada: "success",
  archivada: "warning",
};

const STATUS_LABEL: Record<ShoppingListStatus, string> = {
  borrador: "Borrador",
  activa: "Activa",
  comprada: "Comprada",
  archivada: "Archivada",
};

export function ShoppingListsOverview({ lists, analytics }: ShoppingListsOverviewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardTitle>{formatCurrency(analytics.currentWeekTotal)}</CardTitle>
          <CardDescription>Total de la semana</CardDescription>
        </Card>
        <Card>
          <CardTitle>{formatCurrency(analytics.previousWeekTotal)}</CardTitle>
          <CardDescription>Semana anterior</CardDescription>
        </Card>
        <Card>
          <CardTitle>{formatCurrency(analytics.monthlyTotal)}</CardTitle>
          <CardDescription>Total del mes</CardDescription>
        </Card>
        <Card>
          <CardTitle>{formatCurrency(analytics.fourWeekAverage)}</CardTitle>
          <CardDescription>Media semanal (últimas 4 semanas)</CardDescription>
        </Card>
      </div>

      {lists.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="Todavía no hay listas de la compra."
          description="Crea la primera para empezar a llevar el control del gasto."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {lists.map((list) => (
            <li key={list.id}>
              <Link href={`/compra/listas/${list.id}`}>
                <Card className="flex items-center gap-3 transition-colors hover:bg-sand">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-brown">{list.name}</p>
                    <p className="text-xs text-muted">
                      {list.shopping_date ? formatDate(list.shopping_date) : "Sin fecha"}
                      {list.actual_total != null ? ` · ${formatCurrency(list.actual_total)}` : ""}
                    </p>
                  </div>
                  <Badge variant={STATUS_BADGE[list.status]}>{STATUS_LABEL[list.status]}</Badge>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-20 right-4 z-30 rounded-full px-5 shadow-md md:bottom-6"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Nueva lista de la compra
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nueva lista de la compra">
        <ShoppingListForm onSuccess={() => setIsAddOpen(false)} onCancel={() => setIsAddOpen(false)} />
      </Modal>
    </div>
  );
}
