"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MagnifyingGlass, BookOpen, ForkKnife, Clock, Users, ChartBar } from "@phosphor-icons/react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Recipe } from "@/lib/types";

const TILE_ACCENTS = [
  { color: "text-sage", bg: "bg-sage/10" },
  { color: "text-amber", bg: "bg-amber/10" },
  { color: "text-olive", bg: "bg-olive/10" },
  { color: "text-rose", bg: "bg-rose/10" },
];

export function RecipesExplorer({ recipes }: { recipes: Recipe[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return recipes;
    return recipes.filter(
      (recipe) =>
        recipe.name.toLowerCase().includes(term) ||
        (recipe.description ?? "").toLowerCase().includes(term),
    );
  }, [recipes, search]);

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <MagnifyingGlass
          size={18}
          className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar recetas…"
          aria-label="Buscar recetas"
          className="min-h-[44px] w-full rounded-full border border-border bg-card pl-10 pr-4 text-sm text-brown placeholder:text-muted transition-[border-color,box-shadow] focus:border-terracotta/70 focus:outline-none focus:ring-1 focus:ring-terracotta/50"
        />
      </div>

      {recipes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Todavía no hay recetas."
          description="Añade la primera para empezar."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MagnifyingGlass}
          title="Sin resultados."
          description="Prueba con otro nombre o ingrediente."
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {filtered.map((recipe, index) => {
            const accent = TILE_ACCENTS[index % TILE_ACCENTS.length];
            return (
              <li key={recipe.id}>
                <Link
                  href={`/menu/recetas/${recipe.id}`}
                  className="flex gap-3.5 rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-[var(--shadow-card)] transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                >
                  <span
                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${accent.bg}`}
                    aria-hidden
                  >
                    <ForkKnife weight="regular" size={26} className={accent.color} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-brown">{recipe.name}</span>
                    {recipe.description && (
                      <span className="mt-0.5 line-clamp-2 block text-xs text-muted">
                        {recipe.description}
                      </span>
                    )}
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      {recipe.prep_time_minutes != null && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} aria-hidden /> {recipe.prep_time_minutes} min
                        </span>
                      )}
                      {recipe.difficulty && (
                        <span className="flex items-center gap-1 capitalize">
                          <ChartBar size={12} aria-hidden /> {recipe.difficulty}
                        </span>
                      )}
                      {recipe.servings != null && (
                        <span className="flex items-center gap-1">
                          <Users size={12} aria-hidden /> {recipe.servings}
                        </span>
                      )}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
