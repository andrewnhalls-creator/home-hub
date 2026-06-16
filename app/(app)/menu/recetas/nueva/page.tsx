import Link from "next/link";
import { RecipeForm } from "@/components/meals/RecipeForm";
import { createRecipe } from "@/app/(app)/menu/recetas/actions";

export default function NewRecipePage() {
  return (
    <div className="flex flex-col gap-4">
      <Link href="/menu/recetas" className="text-sm font-medium text-terracotta">
        ← Volver a recetas
      </Link>
      <h1 className="text-xl font-semibold text-brown">Añadir receta</h1>
      <RecipeForm action={createRecipe} submitLabel="Crear receta" />
    </div>
  );
}
