"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { CaretDown, DownloadSimple, FileText, Printer } from "@phosphor-icons/react";
import type { Expense, FixedPayment, SavingsGoal, Subscription } from "@/lib/types";

interface ExportButtonProps {
  expenses: Expense[];
  fixedPayments: FixedPayment[];
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
}

function downloadCsv(filename: string, rows: string[][]): void {
  const escape = (v: string) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const csv = rows.map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({ expenses, fixedPayments, subscriptions, savingsGoals }: ExportButtonProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleExportCsv() {
    setOpen(false);
    downloadCsv("gastos.csv", [
      ["Título", "Importe", "Fecha", "Notas"],
      ...expenses.map((e) => [e.title, String(e.amount), e.expense_date, e.notes ?? ""]),
    ]);
    downloadCsv("pagos-fijos.csv", [
      ["Nombre", "Importe", "Día de vencimiento", "Método de pago", "Activo", "Notas"],
      ...fixedPayments.map((p) => [
        p.name,
        String(p.amount),
        String(p.due_day ?? ""),
        p.payment_method ?? "",
        p.is_active ? "Sí" : "No",
        p.notes ?? "",
      ]),
    ]);
    downloadCsv("suscripciones.csv", [
      ["Nombre", "Importe", "Ciclo de facturación", "Próxima renovación", "Activa", "Notas"],
      ...subscriptions.map((s) => [
        s.name,
        String(s.amount),
        s.billing_cycle,
        s.renewal_date ?? "",
        s.is_active ? "Sí" : "No",
        s.notes ?? "",
      ]),
    ]);
    downloadCsv("objetivos.csv", [
      ["Nombre", "Objetivo", "Acumulado", "Fecha límite", "Prioridad", "Notas"],
      ...savingsGoals.map((g) => [
        g.name,
        String(g.target_amount),
        String(g.current_amount),
        g.target_date ?? "",
        g.priority,
        g.notes ?? "",
      ]),
    ]);
  }

  function handlePrint() {
    flushSync(() => setOpen(false));
    window.print();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-brown transition hover:bg-white/[0.10] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        <DownloadSimple className="h-3.5 w-3.5 text-muted" aria-hidden />
        Exportar
        <CaretDown
          className={`h-3 w-3 text-muted transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1.5 min-w-[168px] overflow-hidden rounded-xl border border-border bg-cream shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
        >
          <button
            role="menuitem"
            type="button"
            onClick={handleExportCsv}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-brown transition hover:bg-white/[0.07] active:bg-white/[0.12] focus-visible:outline-none focus-visible:bg-white/[0.07]"
          >
            <FileText className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            Exportar CSV
          </button>
          <div className="mx-4 h-px bg-border/60" role="separator" />
          <button
            role="menuitem"
            type="button"
            onClick={handlePrint}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-brown transition hover:bg-white/[0.07] active:bg-white/[0.12] focus-visible:outline-none focus-visible:bg-white/[0.07]"
          >
            <Printer className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            Imprimir
          </button>
        </div>
      )}
    </div>
  );
}
