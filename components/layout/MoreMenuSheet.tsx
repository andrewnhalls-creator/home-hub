"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { X } from "lucide-react";
import { MENU_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const ITEM_ACCENTS: Record<string, { iconColor: string; iconBg: string }> = {
  "/dashboard":              { iconColor: "text-terracotta", iconBg: "bg-terracotta/10" },
  "/recordatorios":          { iconColor: "text-amber",      iconBg: "bg-amber/20"      },
  "/tareas":                 { iconColor: "text-olive",      iconBg: "bg-olive/10"      },
  "/menu":                   { iconColor: "text-sage",       iconBg: "bg-sage/20"       },
  "/documentos":             { iconColor: "text-muted",      iconBg: "bg-sand"          },
  "/deseos":                 { iconColor: "text-rose",       iconBg: "bg-rose/20"       },
  "/ajustes":                { iconColor: "text-muted",      iconBg: "bg-sand"          },
  "/ajustes/notificaciones": { iconColor: "text-coral",      iconBg: "bg-coral/10"      },
  "/ajustes/dispositivos":   { iconColor: "text-sage",       iconBg: "bg-sage/10"       },
  "/papelera":               { iconColor: "text-muted",      iconBg: "bg-sand"          },
};

interface MoreMenuSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MoreMenuSheet({ isOpen, onClose }: MoreMenuSheetProps) {
  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="animate-backdrop-enter absolute inset-0 bg-brown/40" aria-hidden />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Menú"
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet-enter relative w-full rounded-t-2xl bg-card px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[var(--shadow-modal)]"
      >
        {/* Handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" aria-hidden />

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-brown">Menú</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta active:scale-[0.97]"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {/* Grid */}
        <ul className="grid grid-cols-3 gap-3">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const accent = ITEM_ACCENTS[item.href] ?? {
              iconColor: "text-terracotta",
              iconBg: "bg-terracotta/10",
            };
            return (
              <li key={item.href + item.label}>
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-card px-2 py-4 text-center transition hover:bg-sand active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
                  )}
                >
                  <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", accent.iconBg)}>
                    <Icon className={cn("h-6 w-6", accent.iconColor)} aria-hidden />
                  </div>
                  <span className="text-xs font-medium leading-tight text-brown">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}
