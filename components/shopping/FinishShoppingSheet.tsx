"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { X, Bag, Warning, CheckCircle, Backspace } from "@phosphor-icons/react";
import { finishQuickPurchase, type ShoppingFormState } from "@/app/(app)/compra/actions";
import { useToast } from "@/components/ui/Toast";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/utils";

interface FinishShoppingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  boughtCount: number;
  pendingCount: number;
}

const initialState: ShoppingFormState = {};

function formatCents(cents: number): string {
  return new Intl.NumberFormat("es-ES", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function FinishShoppingSheet({ isOpen, onClose, boughtCount, pendingCount }: FinishShoppingSheetProps) {
  const [cents, setCents] = useState(0);
  const [state, formAction, isPending] = useActionState(finishQuickPurchase, initialState);
  const { showToast } = useToast();
  const router = useRouter();

  const total = boughtCount + pendingCount;

  useEffect(() => {
    if (state.success) {
      showToast("Compra guardada");
      router.refresh();
      onClose();
    }
  }, [state, showToast, router, onClose]);

  const pressDigit = useCallback((digit: number) => {
    setCents((prev) => (prev >= 100_000_00 ? prev : prev * 10 + digit));
  }, []);

  const pressBackspace = useCallback(() => {
    setCents((prev) => Math.floor(prev / 10));
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") { onClose(); return; }
      if (/^[0-9]$/.test(e.key)) pressDigit(Number(e.key));
      if (e.key === "Backspace") pressBackspace();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose, pressDigit, pressBackspace]);

  if (!isOpen) return null;

  const keypadButton =
    "flex h-14 items-center justify-center rounded-[var(--radius-md)] bg-card text-2xl font-semibold text-brown shadow-[var(--shadow-xs)] transition hover:bg-sand active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta";

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="finish-shopping-title"
      className="animate-sheet-enter fixed inset-0 z-50 flex flex-col bg-cream"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="flex h-11 w-11 items-center justify-center rounded-full text-brown transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        >
          <X weight="bold" size={20} aria-hidden />
        </button>
        <h2 id="finish-shopping-title" className="flex-1 text-center text-lg font-semibold text-sage">
          Finalizar compra
        </h2>
        <div className="w-11" aria-hidden />
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col overflow-y-auto px-5">
        {/* Summary card */}
        <div className="rounded-[var(--radius-xl)] bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2">
            <Bag weight="regular" size={18} className="text-brown" aria-hidden />
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Resumen de la compra
            </p>
          </div>
          <div className="mt-2 flex items-end justify-between gap-3">
            <div>
              <p className="text-2xl font-bold text-terracotta">
                {boughtCount} <span className="text-base font-semibold text-brown">{boughtCount === 1 ? "artículo" : "artículos"}</span>
              </p>
              <p className="text-xs text-muted">{boughtCount === 1 ? "Comprado hoy" : "Comprados hoy"}</p>
            </div>
            {pendingCount > 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold text-olive">
                  {pendingCount} <span className="text-base font-semibold text-brown">{pendingCount === 1 ? "pendiente" : "pendientes"}</span>
                </p>
                <p className="flex items-center justify-end gap-1 text-xs font-medium text-danger">
                  <Warning weight="fill" size={12} aria-hidden />
                  {pendingCount === 1 ? "Queda en lista" : "Quedan en lista"}
                </p>
              </div>
            )}
          </div>
          <div className="mt-3">
            <ProgressBar value={boughtCount} max={total} label="Progreso de la compra" />
          </div>
        </div>

        {/* Amount */}
        <p className="mt-8 text-center text-sm font-medium text-brown">Gasto total del ticket</p>
        <p
          className={cn(
            "mt-2 text-center text-5xl font-bold tabular-nums tracking-tight",
            cents === 0 ? "text-muted/60" : "text-brown",
          )}
          aria-live="polite"
        >
          {formatCents(cents)} <span className="text-3xl">€</span>
        </p>
        {state.error && (
          <p className="mt-2 text-center text-sm text-danger" role="alert">{state.error}</p>
        )}

        {/* Keypad */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
            <button key={digit} type="button" onClick={() => pressDigit(digit)} className={keypadButton}>
              {digit}
            </button>
          ))}
          <div aria-hidden />
          <button type="button" onClick={() => pressDigit(0)} className={keypadButton}>
            0
          </button>
          <button
            type="button"
            onClick={pressBackspace}
            aria-label="Borrar último dígito"
            className="flex h-14 items-center justify-center rounded-[var(--radius-md)] text-brown transition hover:bg-sand active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          >
            <Backspace weight="regular" size={26} aria-hidden />
          </button>
        </div>
      </div>

      {/* Confirm */}
      <div className="border-t border-border bg-cream px-5 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <form action={formAction} className="mx-auto w-full max-w-sm">
          <input type="hidden" name="amountCents" value={cents} />
          <button
            type="submit"
            disabled={isPending || cents === 0}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-terracotta text-base font-semibold text-cream shadow-[var(--shadow-btn)] transition hover:bg-coral active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
          >
            <CheckCircle weight="regular" size={20} aria-hidden />
            {isPending ? "Guardando…" : "Confirmar y guardar"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
