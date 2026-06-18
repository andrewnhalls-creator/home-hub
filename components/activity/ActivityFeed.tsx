"use client";

import { useState } from "react";
import { formatDistanceToNow, isToday, isYesterday, parseISO, format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ShoppingCart,
  UtensilsCrossed,
  Bell,
  Wallet,
  ListChecks,
  Heart,
  FileText,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ActivityLogEntry } from "@/lib/types";

interface ActivityFeedProps {
  entries: ActivityLogEntry[];
  memberMap: Record<string, string>;
}

interface FilterOption {
  label: string;
  value: string | null;
  entityTypes: string[];
}

const FILTERS: FilterOption[] = [
  { label: "Todos",         value: null,          entityTypes: [] },
  { label: "Compra",        value: "compra",      entityTypes: ["shopping_item"] },
  { label: "Menú",          value: "menu",        entityTypes: ["recipe", "menu_plan"] },
  { label: "Recordatorios", value: "recordatorio",entityTypes: ["reminder"] },
  { label: "Finanzas",      value: "finanzas",    entityTypes: ["expense", "fixed_payment", "subscription", "savings_goal"] },
  { label: "Tareas",        value: "tareas",      entityTypes: ["chore"] },
  { label: "Deseos",        value: "deseos",      entityTypes: ["wishlist_item"] },
];

const MODULE_ICON: Record<string, LucideIcon> = {
  shopping_item:  ShoppingCart,
  recipe:         UtensilsCrossed,
  menu_plan:      UtensilsCrossed,
  reminder:       Bell,
  expense:        Wallet,
  fixed_payment:  Wallet,
  subscription:   Wallet,
  savings_goal:   Wallet,
  chore:          ListChecks,
  wishlist_item:  Heart,
  document:       FileText,
};

const MODULE_COLOR: Record<string, string> = {
  shopping_item:  "bg-amber-100 text-amber-700",
  recipe:         "bg-green-100 text-green-700",
  menu_plan:      "bg-green-100 text-green-700",
  reminder:       "bg-rose-100 text-rose-700",
  expense:        "bg-blue-100 text-blue-700",
  fixed_payment:  "bg-blue-100 text-blue-700",
  subscription:   "bg-blue-100 text-blue-700",
  savings_goal:   "bg-blue-100 text-blue-700",
  chore:          "bg-purple-100 text-purple-700",
  wishlist_item:  "bg-pink-100 text-pink-700",
  document:       "bg-slate-100 text-slate-700",
};

function dateGroupLabel(dateStr: string): string {
  const d = parseISO(dateStr);
  if (isToday(d)) return "Hoy";
  if (isYesterday(d)) return "Ayer";
  return format(d, "dd 'de' MMMM", { locale: es });
}

function relativeTime(dateStr: string): string {
  return formatDistanceToNow(parseISO(dateStr), { addSuffix: true, locale: es });
}

export function ActivityFeed({ entries, memberMap }: ActivityFeedProps) {
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filtered =
    activeFilter === null
      ? entries
      : entries.filter((e) => {
          const f = FILTERS.find((f) => f.value === activeFilter);
          return f?.entityTypes.includes(e.entity_type ?? "");
        });

  // Group by calendar day
  const groups: { label: string; key: string; items: ActivityLogEntry[] }[] = [];
  for (const entry of filtered) {
    const key = entry.created_at.slice(0, 10);
    const last = groups[groups.length - 1];
    if (last?.key === key) {
      last.items.push(entry);
    } else {
      groups.push({ label: dateGroupLabel(entry.created_at), key, items: [entry] });
    }
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-24 pt-4">
      <h1 className="text-xl font-semibold text-brown">Actividad</h1>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f.value ?? "todos"}
            type="button"
            onClick={() => setActiveFilter(f.value)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition active:scale-[0.97]",
              activeFilter === f.value
                ? "border-terracotta bg-terracotta text-cream"
                : "border-white/[0.10] bg-white/[0.05] text-brown hover:bg-white/[0.10]",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="Sin actividad"
          description="Todavía no hay actividad registrada."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.key}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                {group.label}
              </p>
              <ul className="flex flex-col gap-0">
                {group.items.map((entry, i) => {
                  const Icon = MODULE_ICON[entry.entity_type ?? ""] ?? Activity;
                  const colorClass = MODULE_COLOR[entry.entity_type ?? ""] ?? "bg-sand text-muted";
                  const isLast = i === group.items.length - 1;
                  const memberName = entry.actor_id ? (memberMap[entry.actor_id] ?? "Miembro") : null;

                  return (
                    <li key={entry.id} className="flex gap-3">
                      {/* Timeline line + icon */}
                      <div className="flex flex-col items-center">
                        <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", colorClass)}>
                          <Icon className="h-4 w-4" aria-hidden />
                        </div>
                        {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
                      </div>

                      {/* Content */}
                      <div className={cn("flex flex-col gap-0.5 pb-4", isLast && "pb-0")}>
                        <p className="text-sm text-brown leading-snug">
                          {entry.summary ?? entry.action ?? "Acción registrada"}
                        </p>
                        <p className="text-xs text-muted">
                          {[memberName, relativeTime(entry.created_at)].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
