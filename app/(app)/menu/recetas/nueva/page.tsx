import Link from "next/link";
import { NewRecipeClient } from "@/components/meals/NewRecipeClient";
import { createRecipe, importRecipeFromUrl } from "@/app/(app)/menu/recetas/actions";

export default function NewRecipePage() {
  return (
    <div className="flex flex-col gap-4 px-4 pb-24 pt-4">
      <Link href="/menu/recetas" className="text-sm font-medium text-terracotta">
        ← Volver a recetas
      </Link>
      <h1 className="text-xl font-semibold text-brown">Añadir receta</h1>
      <NewRecipeClient createAction={createRecipe} importAction={importRecipeFromUrl} />
    </div>
  );
}
