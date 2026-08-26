import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SearchView } from "@/components/search/SearchView";
import type { SearchSection, SearchSectionIcon } from "@/components/search/SearchView";
export const dynamic = "force-dynamic";

interface BuscarPageProps {
  searchParams: Promise<{ q?: string }>;
}

// Order + presentation per module; the search itself is one indexed,
// accent-insensitive RPC (search_household, migration 044).
const MODULES: { key: string; label: string; icon: SearchSectionIcon; href: (id: string) => string }[] = [
  { key: "compra", label: "Compra", icon: "compra", href: () => "/compra" },
  { key: "recordatorios", label: "Recordatorios", icon: "recordatorios", href: () => "/recordatorios" },
  { key: "tareas", label: "Tareas", icon: "tareas", href: () => "/tareas" },
  { key: "pagos", label: "Pagos fijos", icon: "pagos", href: () => "/finanzas" },
  { key: "suscripciones", label: "Suscripciones", icon: "suscripciones", href: () => "/finanzas" },
  { key: "documentos", label: "Documentos", icon: "documentos", href: () => "/documentos" },
  { key: "deseos", label: "Deseos", icon: "deseos", href: () => "/deseos" },
  { key: "recetas", label: "Recetas", icon: "recetas", href: (id) => `/menu/recetas/${id}` },
  { key: "ahorro", label: "Ahorro", icon: "ahorro", href: () => "/finanzas" },
  { key: "calendario", label: "Calendario", icon: "recordatorios", href: () => "/calendario" },
];

export default async function BuscarPage({ searchParams }: BuscarPageProps) {
  await requireHousehold();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (query.length < 2) {
    return <SearchView query={query} sections={[]} />;
  }

  const supabase = await createClient();
  const { data: rows } = await supabase.rpc("search_household", { p_query: query });

  const byModule = new Map<string, { id: string; title: string }[]>();
  for (const row of (rows ?? []) as { module: string; id: string; title: string }[]) {
    const list = byModule.get(row.module) ?? [];
    list.push({ id: row.id, title: row.title });
    byModule.set(row.module, list);
  }

  const sections: SearchSection[] = MODULES.flatMap((m) => {
    const results = byModule.get(m.key);
    if (!results?.length) return [];
    return [
      {
        label: m.label,
        icon: m.icon,
        results: results.map((r) => ({ id: r.id, title: r.title, href: m.href(r.id) })),
      },
    ];
  });

  return <SearchView query={query} sections={sections} />;
}
