"use client";

import { useMemo, useState, useTransition } from "react";
import { format, isToday, isYesterday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Trash, PencilSimple, ShoppingBag, Receipt } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/format";
import { ExpenseForm } from "@/components/finance/ExpenseForm";
import { createExpense, updateExpense, deleteExpense } from "@/app/(app)/finanzas/actions";
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

function dayHeader(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Hoy";
  if (isYesterday(d)) return "Ayer";
  const raw = format(d, "EEEE d MMM", { locale: es });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function ExpensesTab({ expenses, categories, members }: ExpensesTabProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<Expense | null>(null);

  const memberName = useMemo(
    () => new Map(members.map((m) => [m.user_id, m.display_name ?? "Miembro"])),
    [members],
  );

  const grouped = useMemo(() => {
    const map = new Map<string, Expense[]>();
    for (const expense of expenses) {
      const list = map.get(expense.expense_date) ?? [];
      list.push(expense);
      map.set(expense.expense_date, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => b.localeCompare(a));
  }, [expenses]);

  return (
    <div className="flex flex-col gap-3">
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
        <div className="flex flex-col gap-4">
          {grouped.map(([dateStr, dayExpenses]) => (
            <section key={dateStr} aria-label={dayHeader(dateStr)}>
              <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted">
                {dayHeader(dateStr)}
              </h3>
              <ul className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-card shadow-[var(--shadow-card)]">
                {dayExpenses.map((expense, index) => {
                  const cat = categories.find((c) => c.id === expense.category_id);
                  const paidByName = expense.paid_by ? memberName.get(expense.paid_by) : null;
                  const meta = [cat?.name, expense.bank_account, paidByName].filter(Boolean).join(" · ");
                  return (
                    <li
                      key={expense.id}
                      className={index > 0 ? "border-t border-border/60" : undefined}
                    >
                      <div className="flex items-center gap-3 p-3.5">
                        <span
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose/10 text-rose"
                          aria-hidden
                        >
                          <Receipt weight="regular" size={20} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-brown">{expense.title}</p>
                          {meta && <p className="truncate text-xs text-muted">{meta}</p>}
                        </div>
                        <p className="shrink-0 text-sm font-bold tabular-nums text-brown">
                          −{formatCurrency(expense.amount)}
                        </p>
                        <div className="flex shrink-0">
                          <button
                            type="button"
                            aria-label="Editar gasto"
                            onClick={() => setEditingExpense(expense)}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                          >
                            <PencilSimple className="h-4 w-4" aria-hidden />
                          </button>
                          <button
                            type="button"
                            aria-label="Eliminar gasto"
                            onClick={() => setDeletingExpense(expense)}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition hover:text-danger active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                          >
                            <Trash className="h-4 w-4" aria-hidden />
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Button type="button" onClick={() => setIsAddOpen(true)} className="mt-4 w-full">
        <Plus className="h-4 w-4" aria-hidden />
        Añadir gasto
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nuevo gasto">
        <ExpenseForm
          action={createExpense}
          categories={categories}
          members={members}
          onSuccess={() => { setIsAddOpen(false); showToast("Gasto añadido"); }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!editingExpense} onClose={() => setEditingExpense(null)} title="Editar gasto">
        {editingExpense && (
          <ExpenseForm
            action={updateExpense.bind(null, editingExpense.id)}
            categories={categories}
            members={members}
            expense={editingExpense}
            onSuccess={() => { setEditingExpense(null); showToast("Gasto actualizado"); }}
            onCancel={() => setEditingExpense(null)}
          />
        )}
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
