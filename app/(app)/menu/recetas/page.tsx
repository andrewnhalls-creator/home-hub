import Link from "next/link";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { RecipesExplorer } from "@/components/meals/RecipesExplorer";
import { FloatingAddLink } from "@/components/ui/FloatingAddLink";
import type { Recipe } from "@/lib/types";

export default async function RecipesPage() {
  const { householdId } = await requireHousehold();
  const supabase = await createClient();

  const { data: recipes } = await supabase
    .from("recipes")
    .select("*")
    .eq("household_id", householdId)
    .order("name", { ascending: true });

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/menu"
        className="flex min-h-[44px] w-fit items-center gap-1.5 rounded-full pr-3 text-sm font-medium text-muted transition hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        <ArrowLeft weight="bold" className="h-4 w-4" aria-hidden />
        Menú semanal
      </Link>

      <div>
        <h1 className="text-2xl font-bold text-brown">Recetas del hogar</h1>
        <p className="mt-1 text-sm text-muted">
          Vuestra colección para inspirar la próxima comida.
        </p>
      </div>

      <RecipesExplorer recipes={(recipes ?? []) as Recipe[]} />

      <FloatingAddLink href="/menu/recetas/nueva" label="Añadir receta" />
    </div>
  );
}
