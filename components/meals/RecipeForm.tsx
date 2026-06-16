"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import type { RecipeFormState } from "@/app/(app)/menu/recetas/actions";
import type { Recipe } from "@/lib/types";

interface RecipeFormProps {
  action: (prevState: RecipeFormState, formData: FormData) => Promise<RecipeFormState>;
  recipe?: Recipe;
  submitLabel?: string;
}

const initialState: RecipeFormState = {};

const DIFFICULTY_OPTIONS = [
  { value: "fácil", label: "Fácil" },
  { value: "media", label: "Media" },
  { value: "difícil", label: "Difícil" },
];

export function RecipeForm({ action, recipe, submitLabel = "Guardar" }: RecipeFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input
        label="Nombre"
        name="name"
        required
        defaultValue={recipe?.name}
        error={state.fieldErrors?.name}
      />
      <Textarea label="Descripción" name="description" defaultValue={recipe?.description ?? undefined} />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Tiempo de preparación (min)"
          name="prepTimeMinutes"
          type="number"
          defaultValue={recipe?.prep_time_minutes ?? undefined}
          error={state.fieldErrors?.prepTimeMinutes}
        />
        <Input
          label="Comensales"
          name="servings"
          type="number"
          defaultValue={recipe?.servings ?? undefined}
          error={state.fieldErrors?.servings}
        />
      </div>
      <Select
        label="Dificultad"
        name="difficulty"
        placeholder="Sin especificar"
        defaultValue={recipe?.difficulty ?? ""}
        options={DIFFICULTY_OPTIONS}
      />
      <Textarea label="Notas" name="notes" defaultValue={recipe?.notes ?? undefined} />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <Button type="submit" isLoading={isPending}>
        {submitLabel}
      </Button>
    </form>
  );
}
