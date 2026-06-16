import Link from "next/link";
import { BookOpen } from "lucide-react";
import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { FloatingAddLink } from "@/components/ui/FloatingAddLink";

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
      <Link href="/menu" className="text-sm font-medium text-terracotta">
        ← Volver al menú semanal
      </Link>

      {!recipes || recipes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Todavía no hay recetas."
          description="Añade la primera para empezar."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {recipes.map((recipe) => (
            <li key={recipe.id}>
              <Link href={`/menu/recetas/${recipe.id}`}>
                <Card className="transition-colors hover:bg-sand">
                  <CardTitle>{recipe.name}</CardTitle>
                  {(recipe.prep_time_minutes || recipe.difficulty || recipe.servings) && (
                    <CardDescription>
                      {[
                        recipe.prep_time_minutes ? `${recipe.prep_time_minutes} min` : null,
                        recipe.difficulty,
                        recipe.servings ? `${recipe.servings} comensales` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")}
                    </CardDescription>
                  )}
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <FloatingAddLink href="/menu/recetas/nueva" label="Añadir receta" />
    </div>
  );
}
