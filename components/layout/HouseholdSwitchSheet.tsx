"use client";

import { useActionState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { House, Plus, X, CheckCircle } from "@phosphor-icons/react";
import { switchHousehold, type HouseholdSwitchState } from "@/app/(app)/ajustes/actions";
import { cn } from "@/lib/utils";

export interface HouseholdOption {
  id: string;
  name: string;
  memberCount: number;
  isActive: boolean;
}

interface HouseholdSwitchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  households: HouseholdOption[];
}

const switchInitial: HouseholdSwitchState = {};

export function HouseholdSwitchSheet({ isOpen, onClose, households }: HouseholdSwitchSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [switchState, switchAction, isSwitching] = useActionState(switchHousehold, switchInitial);
  const router = useRouter();

  useEffect(() => {
    if (switchState.success) {
      router.refresh();
      onClose();
    }
  }, [switchState.success, router, onClose]);

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
        aria-labelledby="household-switch-title"
        onClick={(e) => e.stopPropagation()}
        className="animate-sheet-enter relative w-full rounded-t-[var(--radius-xl)] bg-card px-5 pt-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[var(--shadow-modal)]"
      >
        {/* Handle */}
        <div className="mx-auto mb-5 h-1 w-10 rounded-full bg-border" aria-hidden />

        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 id="household-switch-title" className="text-base font-semibold text-brown">
            Seleccionar hogar
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

        {switchState.error && (
          <p className="mb-3 text-sm text-danger" role="alert">{switchState.error}</p>
        )}

        {/* Household list */}
        <ul className="flex flex-col gap-2">
          {households.map((household) => (
            <li key={household.id}>
              {household.isActive ? (
                <div className="flex items-center gap-3.5 rounded-[var(--radius-xl)] border border-terracotta/30 bg-terracotta/[0.06] px-4 py-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-terracotta text-cream" aria-hidden>
                    <House weight="fill" size={22} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-brown">{household.name}</p>
                    <p className="text-xs text-muted">Hogar actual</p>
                  </div>
                  <CheckCircle weight="fill" size={22} className="shrink-0 text-terracotta" aria-hidden />
                </div>
              ) : (
                <form action={switchAction}>
                  <input type="hidden" name="householdId" value={household.id} />
                  <button
                    type="submit"
                    disabled={isSwitching}
                    className={cn(
                      "flex w-full items-center gap-3.5 rounded-[var(--radius-xl)] border border-border bg-card px-4 py-3 text-left transition hover:bg-sand active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
                      isSwitching && "opacity-60",
                    )}
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sand text-brown" aria-hidden>
                      <House weight="regular" size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-brown">{household.name}</p>
                      <p className="text-xs text-muted">
                        {household.memberCount === 1 ? "1 miembro" : `${household.memberCount} miembros`}
                      </p>
                    </div>
                  </button>
                </form>
              )}
            </li>
          ))}

          {/* Add another household — managed in Ajustes */}
          <li>
            <Link
              href="/ajustes"
              onClick={onClose}
              className="flex items-center gap-3.5 rounded-[var(--radius-xl)] border border-dashed border-amber/50 px-4 py-3 transition hover:bg-amber/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber/40 text-amber" aria-hidden>
                <Plus weight="bold" size={20} />
              </div>
              <span className="text-sm font-semibold text-amber">Añadir otra casa</span>
            </Link>
          </li>
        </ul>
      </div>
    </div>,
    document.body,
  );
}
