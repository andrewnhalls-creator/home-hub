import { requireHousehold } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SearchView } from "@/components/search/SearchView";
import type { SearchSection } from "@/components/search/SearchView";
import {
  ShoppingCart,
  Bell,
  ListChecks,
  Wallet,
  FileText,
  Heart,
  UtensilsCrossed,
  RefreshCcw,
  PiggyBank,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface BuscarPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function BuscarPage({ searchParams }: BuscarPageProps) {
  const { householdId } = await requireHousehold();
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (query.length < 2) {
    return <SearchView query={query} sections={[]} />;
  }

  const supabase = await createClient();
  const pattern = `%${query}%`;

  const [
    { data: shopping },
    { data: reminders },
    { data: chores },
    { data: payments },
    { data: subs },
    { data: docs },
    { data: wishes },
    { data: recipes },
    { data: savings },
  ] = await Promise.all([
    supabase.from("shopping_items").select("id, name").eq("household_id", householdId).ilike("name", pattern).limit(5),
    supabase.from("reminders").select("id, title").eq("household_id", householdId).ilike("title", pattern).is("deleted_at", null).limit(5),
    supabase.from("chores").select("id, title").eq("household_id", householdId).ilike("title", pattern).limit(5),
    supabase.from("fixed_payments").select("id, name").eq("household_id", householdId).ilike("name", pattern).is("deleted_at", null).limit(5),
    supabase.from("subscriptions").select("id, name").eq("household_id", householdId).ilike("name", pattern).is("deleted_at", null).limit(5),
    supabase.from("household_documents").select("id, title").eq("household_id", householdId).ilike("title", pattern).is("deleted_at", null).limit(5),
    supabase.from("wishlist_items").select("id, name").eq("household_id", householdId).ilike("name", pattern).limit(5),
    supabase.from("recipes").select("id, name").eq("household_id", householdId).ilike("name", pattern).limit(5),
    supabase.from("savings_goals").select("id, name").eq("household_id", householdId).ilike("name", pattern).is("deleted_at", null).limit(5),
  ]);

  const sections: SearchSection[] = [
    {
      label: "Compra",
      icon: ShoppingCart,
      results: (shopping ?? []).map((r) => ({ id: r.id, title: r.name, href: "/compra" })),
    },
    {
      label: "Recordatorios",
      icon: Bell,
      results: (reminders ?? []).map((r) => ({ id: r.id, title: r.title, href: "/recordatorios" })),
    },
    {
      label: "Tareas",
      icon: ListChecks,
      results: (chores ?? []).map((r) => ({ id: r.id, title: r.title, href: "/tareas" })),
    },
    {
      label: "Pagos fijos",
      icon: Wallet,
      results: (payments ?? []).map((r) => ({ id: r.id, title: r.name, href: "/finanzas" })),
    },
    {
      label: "Suscripciones",
      icon: RefreshCcw,
      results: (subs ?? []).map((r) => ({ id: r.id, title: r.name, href: "/finanzas" })),
    },
    {
      label: "Documentos",
      icon: FileText,
      results: (docs ?? []).map((r) => ({ id: r.id, title: r.title, href: "/documentos" })),
    },
    {
      label: "Deseos",
      icon: Heart,
      results: (wishes ?? []).map((r) => ({ id: r.id, title: r.name, href: "/deseos" })),
    },
    {
      label: "Recetas",
      icon: UtensilsCrossed,
      results: (recipes ?? []).map((r) => ({ id: r.id, title: r.name, href: `/menu/recetas/${r.id}` })),
    },
    {
      label: "Ahorro",
      icon: PiggyBank,
      results: (savings ?? []).map((r) => ({ id: r.id, title: r.name, href: "/finanzas" })),
    },
  ].filter((s) => s.results.length > 0);

  return <SearchView query={query} sections={sections} />;
}
