"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { upsertMealPlan, deleteMealPlan, type MealPlanFormState } from "@/app/(app)/menu/actions";
import type { MealType } from "@/lib/types";

interface MealSlotMeal {
  id: string;
  custom_name: string | null;
  recipe_id: string | null;
  recipes: { name: string } | null;
}

interface MealSlotProps {
  date: string;
  mealType: MealType;
  label: string;
  meal?: MealSlotMeal;
  recipes: { id: string; name: string }[];
}

const initialState: MealPlanFormState = {};

function MealPlanForm({
  date,
  mealType,
  meal,
  recipes,
  onSuccess,
  onCancel,
}: MealSlotProps & { onSuccess: () => void; onCancel: () => void }) {
  const boundAction = upsertMealPlan.bind(null, meal?.id);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="plannedDate" value={date} />
      <input type="hidden" name="mealType" value={mealType} />

      <Select
        label="Receta"
        name="recipeId"
        placeholder="Sin receta (comida libre)"
        defaultValue={meal?.recipe_id ?? ""}
        options={recipes.map((recipe) => ({ value: recipe.id, label: recipe.name }))}
      />
      <Input
        label="Nombre (si no usas una receta)"
        name="customName"
        defaultValue={meal?.custom_name ?? ""}
        error={state.fieldErrors?.customName}
      />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="mt-2 flex gap-3">
        {meal && (
          <Button
            type="button"
            variant="danger"
            isLoading={isDeleting}
            onClick={async () => {
              setIsDeleting(true);
              await deleteMealPlan(meal.id);
              setIsDeleting(false);
              onSuccess();
            }}
          >
            Eliminar
          </Button>
        )}
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

export function MealSlot({ date, mealType, label, meal, recipes }: MealSlotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mealName = meal?.recipes?.name ?? meal?.custom_name;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex min-h-[64px] w-full flex-col items-start gap-0.5 rounded-xl border border-border bg-card p-2 text-left"
      >
        <span className="text-[12px] font-medium text-muted">{label}</span>
        {mealName ? (
          <span className="text-sm text-brown">{mealName}</span>
        ) : (
          <span className="flex items-center gap-1 text-sm text-muted">
            <Plus className="h-3.5 w-3.5" aria-hidden /> Añadir
          </span>
        )}
      </button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={label}>
        <MealPlanForm
          date={date}
          mealType={mealType}
          label={label}
          meal={meal}
          recipes={recipes}
          onSuccess={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
}
