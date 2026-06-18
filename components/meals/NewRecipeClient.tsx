"use client";

import { useActionState, useState } from "react";
import { Link2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { RecipeForm } from "@/components/meals/RecipeForm";
import type { RecipeFormState } from "@/app/(app)/menu/recetas/actions";
import type { ImportRecipeState } from "@/app/(app)/menu/recetas/actions";
import type { Recipe } from "@/lib/types";

interface NewRecipeClientProps {
  createAction: (prevState: RecipeFormState, formData: FormData) => Promise<RecipeFormState>;
  importAction: (prevState: ImportRecipeState, formData: FormData) => Promise<ImportRecipeState>;
}

export function NewRecipeClient({ createAction, importAction }: NewRecipeClientProps) {
  const [importState, importFormAction, importing] = useActionState(importAction, {});
  const [formKey, setFormKey] = useState(0);

  // Re-key the RecipeForm when new data arrives so defaultValues apply.
  const [prevImportData, setPrevImportData] = useState(importState.data);
  if (importState.data !== prevImportData) {
    setPrevImportData(importState.data);
    if (importState.data) setFormKey((k) => k + 1);
  }

  // Build a fake Recipe object to pre-fill form defaults from import.
  const prefilledRecipe: Recipe | undefined = importState.data
    ? {
        id: "",
        household_id: "",
        name: importState.data.name,
        description: importState.data.description ?? null,
        prep_time_minutes: null,
        difficulty: null,
        servings: importState.data.servings ?? null,
        notes: importState.data.ingredients?.length
          ? importState.data.ingredients.join("\n")
          : null,
        created_by: null,
        created_at: "",
        updated_at: "",
      }
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      {/* URL import section */}
      <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted" aria-hidden />
          <p className="text-sm font-medium text-brown">Importar desde URL</p>
        </div>
        <form action={importFormAction} className="flex gap-2">
          <input
            name="url"
            type="url"
            placeholder="https://ejemplo.com/receta"
            aria-label="URL de la receta"
            className="min-h-[44px] flex-1 rounded-xl border border-border bg-white px-3 py-2 text-sm text-brown placeholder:text-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          />
          <Button type="submit" variant="secondary" isLoading={importing} className="shrink-0">
            Importar
          </Button>
        </form>

        {importState.error && (
          <p className="text-xs text-danger" role="alert">{importState.error}</p>
        )}
        {importState.data && !importing && (
          <div className="flex items-center gap-1.5 text-xs text-sage">
            <CheckCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>Datos importados. Revisa y edita antes de guardar.</span>
          </div>
        )}
      </div>

      {/* Manual / pre-filled recipe form */}
      <RecipeForm
        key={formKey}
        action={createAction}
        recipe={prefilledRecipe}
        submitLabel="Crear receta"
      />
    </div>
  );
}
