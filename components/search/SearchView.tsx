"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";
import { EmptyState } from "@/components/ui/EmptyState";

export interface SearchSection {
  label: string;
  icon: Icon;
  results: Array<{ id: string; title: string; href: string }>;
}

interface SearchViewProps {
  query: string;
  sections: SearchSection[];
}

export function SearchView({ query, sections }: SearchViewProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasQuery = query.length >= 2;
  const hasResults = sections.length > 0;

  function handleClear() {
    router.push("/buscar");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  return (
    <div className="flex flex-col gap-5">
      <form action="/buscar" method="get" role="search" className="relative flex items-center">
        <MagnifyingGlass className="pointer-events-none absolute left-3.5 h-4 w-4 text-muted" aria-hidden />
        <input
          ref={inputRef}
          name="q"
          type="search"
          defaultValue={query}
          autoFocus
          autoComplete="off"
          placeholder="Buscar en Home Hub…"
          aria-label="Buscar"
          className="h-11 w-full rounded-2xl border border-border bg-card pl-10 pr-10 text-sm text-brown placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-terracotta"
        />
        {query && (
          <button
            type="button"
            aria-label="Borrar búsqueda"
            onClick={handleClear}
            className="absolute right-2 flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.85]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        )}
      </form>

      {!hasQuery && (
        <EmptyState
          icon={MagnifyingGlass}
          title="Busca en toda la app"
          description="Escribe al menos 2 caracteres para buscar productos, tareas, documentos y más."
        />
      )}

      {hasQuery && !hasResults && (
        <EmptyState
          icon={MagnifyingGlass}
          title={`Sin resultados para «${query}»`}
          description="Prueba con otra palabra o comprueba la ortografía."
        />
      )}

      {hasResults && (
        <div className="flex flex-col gap-5">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div key={section.label}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-3.5 w-3.5 text-muted" aria-hidden />
                  <p className="text-xs font-medium text-muted">{section.label}</p>
                </div>
                <ul className="flex flex-col gap-1">
                  {section.results.map((result) => (
                    <li key={result.id}>
                      <Link
                        href={result.href}
                        className="flex min-h-[44px] items-center rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-brown transition hover:bg-sand active:scale-[0.98]"
                      >
                        {result.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
