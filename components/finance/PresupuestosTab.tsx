"use client";

import { useActionState, useEffect, useState } from "react";
import { ChartPie, PencilSimple, Plus, Trash } from "@phosphor-icons/react";
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

interface BudgetFormProps {
  categories: Category[];
  editingBudget?: { category_id: string; monthly_amount: number; categoryName: string } | null;
  onSuccess: () => void;
  onCancel: () => void;
}

function BudgetForm({ categories, editingBudget, onSuccess, onCancel }: BudgetFormProps) {
  const [state, formAction, isPending] = useActionState<BudgetFormState, FormData>(
    upsertCategoryBudget,
    {},
  );

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      {editingBudget ? (
        <>
          <input type="hidden" name="categoryId" value={editingBudget.category_id} />
          <div>
            <p className="mb-1 text-xs font-medium text-muted">Categoría</p>
            <p className="text-sm font-medium text-brown">{editingBudget.categoryName}</p>
          </div>
        </>
      ) : (
        <Select
          label="Categoría"
          name="categoryId"
          required
          placeholder="Selecciona categoría"
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
          error={state.fieldErrors?.categoryId}
        />
      )}
      <Input
        label="Importe mensual (€)"
        name="monthlyAmount"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        required
        placeholder="0,00"
        defaultValue={editingBudget ? String(editingBudget.monthly_amount) : undefined}
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
  const [editingBudget, setEditingBudget] = useState<{
    category_id: string;
    monthly_amount: number;
    categoryName: string;
  } | null>(null);
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

  // How far through the cycle we are, to compare spend pace vs time elapsed.
  const cycleStartMs = new Date(`${cycleStart}T00:00:00`).getTime();
  const cycleEndMs = new Date(`${cycleEnd}T23:59:59`).getTime();
  const [nowMs] = useState(() => Date.now());
  const cycleDays = Math.max(1, Math.round((cycleEndMs - cycleStartMs) / 86_400_000));
  const dayOfCycle = Math.min(
    cycleDays,
    Math.max(1, Math.ceil((nowMs - cycleStartMs) / 86_400_000)),
  );
  const monthElapsedPct = Math.min(100, Math.round((dayOfCycle / cycleDays) * 100));

  function statusChip(pct: number): { label: string; className: string } | null {
    if (pct > 100) return { label: "Excedido", className: "bg-danger-soft text-danger" };
    if (pct >= monthElapsedPct + 10)
      return { label: "Precaución", className: "bg-warning-soft text-warning-text" };
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {categoryBudgets.length === 0 ? (
        <EmptyState
          icon={ChartPie}
          title="Sin gastos variables."
          description="Define cuánto queréis gastar cada mes en alimentación, ocio, mascotas y más."
          action={
            <Button type="button" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Añadir gasto variable
            </Button>
          }
        />
      ) : (
        <>
          {/* Summary */}
          <div className="rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-[var(--shadow-card)]">
            <p className="text-xs font-medium text-muted">Total presupuestado</p>
            <p className="mt-0.5 text-2xl font-bold tabular-nums text-brown">
              {formatCurrency(totalBudgeted)}
              <span className="text-sm font-medium text-muted"> /mes</span>
            </p>
            <div className="mt-2.5 flex items-center justify-between gap-4 text-xs">
              <span className="text-muted">Gastado ({Math.round(totalPct)}%)</span>
              <span className={cn("font-semibold tabular-nums", totalPct > 100 ? "text-danger" : "text-brown")}>
                {formatCurrency(totalSpent)}
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-sand">
              <div
                className={cn("h-full rounded-full transition-transform", progressColor(totalPct))}
                style={{ width: `${Math.min(totalPct, 100)}%` }}
              />
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-terracotta"
                aria-hidden
              />
              Día {dayOfCycle} de {cycleDays} ({monthElapsedPct}% del ciclo)
            </p>
          </div>

          {/* Per-category rows */}
          <p className="text-sm font-semibold text-brown">Categorías</p>
          <div className="flex flex-col gap-3">
            {budgetsWithSpend.map((b) => {
              const cat = categoryMap.get(b.category_id);
              const chip = statusChip(b.pct);
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
                    <span className="min-w-0 flex-1 text-sm font-semibold text-brown">
                      {cat?.name ?? "Categoría"}
                    </span>
                    {chip && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          chip.className,
                        )}
                      >
                        {chip.label}
                      </span>
                    )}
                    <span className="shrink-0 text-xs text-muted tabular-nums">
                      {formatCurrency(b.spent)} / {formatCurrency(b.monthly_amount)}
                    </span>
                    <button
                      type="button"
                      aria-label={`Editar gasto variable de ${cat?.name ?? "categoría"}`}
                      onClick={() =>
                        setEditingBudget({
                          category_id: b.category_id,
                          monthly_amount: b.monthly_amount,
                          categoryName: cat?.name ?? "Categoría",
                        })
                      }
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition hover:text-brown active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                    >
                      <PencilSimple className="h-4 w-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Eliminar gasto variable de ${cat?.name ?? "categoría"}`}
                      onClick={() => setDeletingId(b.id)}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted transition hover:text-danger active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                    >
                      <Trash className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-sand">
                    <div
                      className={cn("h-full rounded-full transition-all", progressColor(b.pct))}
                      style={{ width: `${Math.min(b.pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted">
                    Gastado: {Math.round(b.pct)}% · Mes: {monthElapsedPct}%
                  </p>
                  {b.pct > 100 ? (
                    <p className="text-xs font-medium text-danger">
                      Excedido en {formatCurrency(b.spent - b.monthly_amount)}
                    </p>
                  ) : b.pct >= monthElapsedPct + 10 ? (
                    <p className="text-xs text-warning-text">
                      El gasto va por delante del ritmo del mes.
                    </p>
                  ) : null}
                </Card>
              );
            })}
          </div>
        </>
      )}

      <Button type="button" onClick={() => setIsAddOpen(true)} className="mt-2 w-full">
        <Plus className="h-4 w-4" aria-hidden />
        Añadir gasto variable
      </Button>

      {/* Add modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nuevo gasto variable">
        <BudgetForm
          categories={categories}
          onSuccess={() => { setIsAddOpen(false); showToast("Gasto variable guardado"); }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editingBudget} onClose={() => setEditingBudget(null)} title="Editar gasto variable">
        {editingBudget && (
          <BudgetForm
            categories={categories}
            editingBudget={editingBudget}
            onSuccess={() => { setEditingBudget(null); showToast("Gasto variable actualizado"); }}
            onCancel={() => setEditingBudget(null)}
          />
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deletingId} onClose={() => setDeletingId(null)} title="Eliminar gasto variable">
        <p className="text-sm text-brown">¿Seguro que quieres eliminar este gasto variable?</p>
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
              showToast("Gasto variable eliminado");
            }}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
