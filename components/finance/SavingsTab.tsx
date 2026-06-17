"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { Plus, Trash2, PiggyBank } from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/format";
import { createSavingsGoal, deleteSavingsGoal, addContribution, type FinanceFormState } from "@/app/(app)/finanzas/actions";
import type { SavingsGoal } from "@/lib/types";

interface SavingsTabProps {
  goals: SavingsGoal[];
}

const initialState: FinanceFormState = {};

const PRIORITY_OPTIONS = [
  { value: "baja", label: "Baja" },
  { value: "normal", label: "Normal" },
  { value: "alta", label: "Alta" },
];

function AddGoalForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const [state, formAction, isPending] = useActionState(createSavingsGoal, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input label="Nombre del objetivo" name="name" required error={state.fieldErrors?.name} />
      <Input
        label="Importe objetivo (€)"
        name="targetAmount"
        type="number"
        step="0.01"
        required
        error={state.fieldErrors?.targetAmount}
      />
      <Input label="Fecha objetivo" name="targetDate" type="date" />
      <Select label="Prioridad" name="priority" defaultValue="normal" options={PRIORITY_OPTIONS} />
      <Textarea label="Notas" name="notes" />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" isLoading={isPending}>
          Crear objetivo
        </Button>
      </div>
    </form>
  );
}

function ContributionForm({ goalId, onSuccess, onCancel }: { goalId: string; onSuccess: () => void; onCancel: () => void }) {
  const boundAction = addContribution.bind(null, goalId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input
        label="Importe (€)"
        name="amount"
        type="number"
        step="0.01"
        required
        error={state.fieldErrors?.amount}
      />
      <Input label="Fecha" name="contributionDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
      <Textarea label="Notas" name="notes" />
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

export function SavingsTab({ goals }: SavingsTabProps) {
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<SavingsGoal | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {goals.length === 0 ? (
        <EmptyState icon={PiggyBank} title="Todavía no hay objetivos de ahorro." description="Crea el primero para empezar." />
      ) : (
        <ul className="flex flex-col gap-3">
          {goals.map((goal) => (
            <li key={goal.id}>
              <Card>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle>{goal.name}</CardTitle>
                  <button
                    type="button"
                    aria-label="Eliminar objetivo"
                    onClick={() => setDeletingGoal(goal)}
                    className="text-muted hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <p className="mt-1 text-sm text-muted">
                  {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                </p>
                <ProgressBar className="mt-2" value={goal.current_amount} max={goal.target_amount} label={goal.name} />
                <Button type="button" variant="secondary" className="mt-3" onClick={() => setContributingGoal(goal)}>
                  Añadir aportación
                </Button>
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
        Crear objetivo
      </Button>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Crear objetivo de ahorro">
        <AddGoalForm onSuccess={() => { setIsAddOpen(false); showToast("Objetivo creado"); }} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      <Modal isOpen={!!contributingGoal} onClose={() => setContributingGoal(null)} title="Añadir aportación">
        {contributingGoal && (
          <ContributionForm
            goalId={contributingGoal.id}
            onSuccess={() => { setContributingGoal(null); showToast("Aportación añadida"); }}
            onCancel={() => setContributingGoal(null)}
          />
        )}
      </Modal>

      <Modal isOpen={!!deletingGoal} onClose={() => setDeletingGoal(null)} title="Eliminar objetivo">
        <p className="text-sm text-brown">¿Seguro que quieres eliminarlo?</p>
        <div className="mt-4 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setDeletingGoal(null)}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            className="flex-1"
            isLoading={isPending}
            onClick={() =>
              startTransition(async () => {
                if (deletingGoal) await deleteSavingsGoal(deletingGoal.id);
                setDeletingGoal(null);
                showToast("Objetivo eliminado");
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
