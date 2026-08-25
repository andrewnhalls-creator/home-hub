"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X, ShoppingCart, Receipt, ListChecks, CalendarPlus,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const QUICK_ACTIONS = [
  {
    href: "/compra",
    label: "Añadir a la compra",
    description: "Apunta algo antes de que se te olvide",
    icon: ShoppingCart,
    iconColor: "text-sage",
    iconBg: "bg-sage/10",
  },
  {
    href: "/finanzas",
    label: "Registrar un gasto",
    description: "Anota un gasto del hogar",
    icon: Receipt,
    iconColor: "text-amber",
    iconBg: "bg-amber/10",
  },
  {
    href: "/tareas",
    label: "Nueva tarea",
    description: "Reparte las cosas de casa",
    icon: ListChecks,
    iconColor: "text-olive",
    iconBg: "bg-olive/10",
  },
  {
    href: "/calendario",
    label: "Nuevo evento",
    description: "Añade un plan al calendario",
    icon: CalendarPlus,
    iconColor: "text-terracotta",
    iconBg: "bg-terracotta/10",
  },
];

interface QuickAddSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddSheet({ isOpen, onClose }: QuickAddSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (e.key !== "Tab" || !sheetRef.current) return;
      const focusable = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    sheetRef.current?.querySelector<HTMLElement>("button, a[href]")?.focus();
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end" onClick={onClose}>
      {/* Backdrop */}
      <div
        className="animate-backdrop-enter absolute inset-0 bg-black/40"
        style={{ backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }}
        aria-hidden
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quick-add-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet-enter relative w-full rounded-t-[var(--radius-xl)] bg-card px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[var(--shadow-modal)]"
      >
        {/* Handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" aria-hidden />

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 id="quick-add-title" className="text-base font-semibold text-brown">
            ¿Qué quieres añadir?
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta active:scale-[0.97]"
          >
            <X weight="light" size={18} aria-hidden />
          </button>
        </div>

        {/* Actions */}
        <ul className="flex flex-col gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <li key={action.href}>
                <Link
                  href={action.href}
                  onClick={onClose}
                  className="flex items-center gap-3.5 rounded-[var(--radius-xl)] border border-border bg-card px-4 py-3.5 transition hover:bg-sand active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                >
                  <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", action.iconBg)}>
                    <Icon weight="regular" size={22} className={action.iconColor} aria-hidden />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brown">{action.label}</p>
                    <p className="truncate text-xs text-muted">{action.description}</p>
                  </div>
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
