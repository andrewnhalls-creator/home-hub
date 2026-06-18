"use client";

import { useActionState, useEffect, useTransition } from "react";
import { Trash } from "@phosphor-icons/react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import {
  addIngredient,
  deleteIngredient,
  type IngredientFormState,
} from "@/app/(app)/menu/recetas/actions";
import type { Category, RecipeIngredient } from "@/lib/types";

interface IngredientListProps {
  recipeId: string;
  ingredients: RecipeIngredient[];
  categories: Category[];
}

const initialState: IngredientFormState = {};

export function IngredientList({ recipeId, ingredients, categories }: IngredientListProps) {
  const boundAction = addIngredient.bind(null, recipeId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);
  const [isDeleting, startDeleteTransition] = useTransition();
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  useEffect(() => {
    if (state.success) {
      const form = document.getElementById("add-ingredient-form") as HTMLFormElement | null;
      form?.reset();
    }
  }, [state.success]);

  return (
    <div className="flex flex-col gap-3">
      {ingredients.length === 0 ? (
        <p className="text-sm text-muted">Todavía no hay ingredientes.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {ingredients.map((ingredient) => (
            <li
              key={ingredient.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-3 py-2"
            >
              <span className="text-sm text-brown">
                {ingredient.name}
                {ingredient.quantity && (
                  <span className="text-muted">
                    {" "}
                    — {ingredient.quantity} {ingredient.unit}
                  </span>
                )}
                {ingredient.category_id && categoryById.get(ingredient.category_id) && (
                  <span className="text-muted"> · {categoryById.get(ingredient.category_id)?.name}</span>
                )}
              </span>
              <button
                type="button"
                aria-label="Eliminar ingrediente"
                disabled={isDeleting}
                onClick={() => startDeleteTransition(() => deleteIngredient(recipeId, ingredient.id))}
                className="text-muted hover:text-danger"
              >
                <Trash className="h-4 w-4" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form id="add-ingredient-form" action={formAction} noValidate className="flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-2">
          <Input label="Ingrediente" name="name" required className="col-span-3" error={state.fieldErrors?.name} />
          <Input label="Cantidad" name="quantity" type="number" step="any" />
          <Input label="Unidad" name="unit" />
          <Select
            label="Categoría"
            name="categoryId"
            placeholder="Sin categoría"
            options={categories.map((category) => ({ value: category.id, label: category.name }))}
          />
        </div>
        <Button type="submit" variant="secondary" isLoading={isPending}>
          Añadir ingrediente
        </Button>
      </form>
    </div>
  );
}
