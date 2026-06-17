"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/format";
import { ExpenseForm } from "@/components/finance/ExpenseForm";
import { ExpenseCharts } from "@/components/finance/ExpenseCharts";
import { createExpense, deleteExpense } from "@/app/(app)/finanzas/actions";
import type { Category, Expense } from "@/lib/types";

interface Member {
  user_id: string;
  display_name: string | null;
}

interface ExpensesTabProps {
  expenses: Expense[];
  categories: Category[];
  members: Member[];
}

export function ExpensesTab({ expenses, categories, members }: ExpensesTabProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <ExpenseCharts expenses={expenses} categories={categories} />
      {expenses.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Sin gastos registrados."
          description="Apuntad los gastos variables del hogar — supermercado, restaurantes, ropa — y ved en qué se va el dinero cada mes."
          action={
            <Button type="button" onClick={() => setIsAddOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Añadir gasto
            </Button>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {expenses.map((expense) => (
            <li key={expense.id}>
              <Card className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-brown">{expense.title}</p>
                  <p className="text-xs text-muted">{formatDate(expense.expense_date)}</p>
                </div>
                <p className="text-sm font-medium text-brown">{formatCurrency(expense.amount)}</p>
                <button
                  type="button"
                  aria-label="Eliminar gasto"
                  onClick={() => setDeletingExpense(expense)}
                  className="text-muted hover:text-danger"
                >
                  <Trash2 className="h-4 w-4" aria-hidden />
                </button>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="mt-4 w-full"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Añadir gasto
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir gasto">
        <ExpenseForm
          action={createExpense}
          categories={categories}
          members={members}
          onSuccess={() => { setIsAddOpen(false); showToast("Gasto añadido"); }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!deletingExpense} onClose={() => setDeletingExpense(null)} title="Eliminar gasto">
        <p className="text-sm text-brown">¿Seguro que quieres eliminarlo?</p>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setDeletingExpense(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            isLoading={isPending}
            onClick={() =>
              startTransition(async () => {
                if (deletingExpense) await deleteExpense(deletingExpense.id);
                setDeletingExpense(null);
                showToast("Gasto eliminado");
              })
            }
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
}
