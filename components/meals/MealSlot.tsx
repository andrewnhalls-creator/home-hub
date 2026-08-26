"use client";

import { useActionState, useEffect, useState } from "react";
import { Plus, Coffee, Sun, MoonStars, Cookie, type Icon } from "@phosphor-icons/react";
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

const MEAL_VISUALS: Record<MealType, { icon: Icon; color: string; bg: string }> = {
  desayuno: { icon: Coffee,    color: "text-sage",  bg: "bg-sage/10"  },
  comida:   { icon: Sun,       color: "text-amber", bg: "bg-amber/10" },
  cena:     { icon: MoonStars, color: "text-olive", bg: "bg-olive/10" },
  snack:    { icon: Cookie,    color: "text-rose",  bg: "bg-rose/10"  },
};

export function MealSlot({ date, mealType, label, meal, recipes }: MealSlotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mealName = meal?.recipes?.name ?? meal?.custom_name;
  const visual = MEAL_VISUALS[mealType];
  const VisualIcon = visual.icon;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={
          mealName
            ? "flex min-h-[56px] w-full items-center gap-3 rounded-[var(--radius-xl)] border border-border bg-card p-3 text-left shadow-[var(--shadow-card)] transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
            : "flex min-h-[56px] w-full items-center gap-3 rounded-[var(--radius-xl)] border border-dashed border-border bg-card/60 p-3 text-left transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        }
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${visual.bg}`}
          aria-hidden
        >
          <VisualIcon weight="regular" size={18} className={visual.color} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-[10px] font-semibold uppercase tracking-wider ${visual.color}`}>
            {label}
          </span>
          {mealName ? (
            <span className="block truncate text-sm font-medium text-brown">{mealName}</span>
          ) : (
            <span className="block truncate text-sm italic text-muted">Planificar {label.toLowerCase()}…</span>
          )}
        </span>
        {!mealName && (
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted"
            aria-hidden
          >
            <Plus size={14} />
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
