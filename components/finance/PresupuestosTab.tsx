"use client";

import { useActionState, useEffect, useState } from "react";
import { ChartPie, Plus, Trash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/format";
import {
  upsertCategoryBudget,
  deleteCategoryBudget,
  type BudgetFormState,
} from "@/app/(app)/finanzas/budgetActions";
import type { Category, CategoryBudget, Expense } from "@/lib/types";

interface PresupuestosTabProps {
  categoryBudgets: CategoryBudget[];
  expenses: Expense[];
  categories: Category[];
  cycleStart: string;
  cycleEnd: string;
}

function progressColor(pct: number): string {
  if (pct > 100) return "bg-danger";
  if (pct >= 80) return "bg-amber";
  return "bg-sage";
}

function BudgetForm({
  categories,
  onSuccess,
  onCancel,
}: {
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, isPending] = useActionState<BudgetFormState, FormData>(
    upsertCategoryBudget,
    {},
  );

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Select
        label="Categoría"
        name="categoryId"
        required
        placeholder="Selecciona categoría"
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
        error={state.fieldErrors?.categoryId}
      />
      <Input
        label="Presupuesto mensual (€)"
        name="monthlyAmount"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        required
        placeholder="0,00"
        error={state.fieldErrors?.monthlyAmount}
      />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" isLoading={isPending}>
          Guardar
        </Button>
      </div>
    </form>
  );
}

export function PresupuestosTab({
  categoryBudgets,
  expenses,
  categories,
  cycleStart,
  cycleEnd,
}: PresupuestosTabProps) {
  const { showToast } = useToast();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const cycleExpenses = expenses.filter(
    (e) => e.expense_date >= cycleStart && e.expense_date <= cycleEnd,
  );

  const budgetsWithSpend = categoryBudgets.map((b) => {
    const spent = cycleExpenses
      .filter((e) => e.category_id === b.category_id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    const pct = b.monthly_amount > 0 ? (spent / b.monthly_amount) * 100 : 0;
    return { ...b, spent, pct };
  });

  const totalBudgeted = categoryBudgets.reduce((sum, b) => sum + Number(b.monthly_amount), 0);
  const totalSpent = budgetsWithSpend.reduce((sum, b) => sum + b.spent, 0);
  const totalPct = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <div className="flex flex-col gap-4">
      {categoryBudgets.length === 0 ? (
        <EmptyState
          icon={ChartPie}
          title="Sin presupuestos por categoría."
          description="Define cuánto queréis gastar cada mes en alimentación, ocio, mascotas y más."
          action={
            <Button type="button" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Añadir presupuesto
            </Button>
          }
        />
      ) : (
        <>
          {/* Summary */}
          <Card variant="subtle">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted">Total presupuestado</span>
              <span className="text-sm font-bold text-brown tabular-nums">
                {formatCurrency(totalBudgeted)}/mes
              </span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-border">
              <div
                className={cn("h-full rounded-full transition-transform", progressColor(totalPct))}
                style={{ width: `${Math.min(totalPct, 100)}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-4">
              <span className="text-xs text-muted">Gastado este ciclo</span>
              <span className={cn("text-xs font-semibold tabular-nums", totalPct > 100 ? "text-danger" : "text-brown")}>
                {formatCurrency(totalSpent)}
              </span>
            </div>
          </Card>

          {/* Per-category cards */}
          <div className="flex flex-col gap-3">
            {budgetsWithSpend.map((b) => {
              const cat = categoryMap.get(b.category_id);
              return (
                <Card key={b.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {cat?.color && (
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{ backgroundColor: cat.color }}
                        aria-hidden
                      />
                    )}
                    <span className="min-w-0 flex-1 text-sm font-medium text-brown">
                      {cat?.name ?? "Categoría"}
                    </span>
                    <span className="shrink-0 text-xs text-muted tabular-nums">
                      {formatCurrency(b.spent)} / {formatCurrency(b.monthly_amount)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Eliminar presupuesto de ${cat?.name ?? "categoría"}`}
                      onClick={() => setDeletingId(b.id)}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted transition hover:text-danger active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                    >
                      <Trash className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className={cn("h-full rounded-full transition-all", progressColor(b.pct))}
                      style={{ width: `${Math.min(b.pct, 100)}%` }}
                    />
                  </div>
                  {b.pct > 100 && (
                    <p className="text-xs text-danger">
                      Excedido en {formatCurrency(b.spent - b.monthly_amount)}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </>
      )}

      <Button type="button" onClick={() => setIsAddOpen(true)} className="mt-2 w-full">
        <Plus className="h-4 w-4" aria-hidden />
        Añadir presupuesto
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nuevo presupuesto">
        <BudgetForm
          categories={categories}
          onSuccess={() => { setIsAddOpen(false); showToast("Presupuesto guardado"); }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Eliminar presupuesto">
        <p className="text-sm text-brown">¿Seguro que quieres eliminar este presupuesto?</p>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setDeletingId(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            isLoading={isDeleting}
            onClick={async () => {
              if (!deletingId) return;
              setIsDeleting(true);
              await deleteCategoryBudget(deletingId);
              setDeletingId(null);
              setIsDeleting(false);
              showToast("Presupuesto eliminado");
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
