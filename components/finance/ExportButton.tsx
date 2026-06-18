"use client";

import { Download } from "lucide-react";
import type { Expense, FixedPayment, SavingsGoal, Subscription } from "@/lib/types";

interface ExportButtonProps {
  expenses: Expense[];
  fixedPayments: FixedPayment[];
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
}

function downloadCsv(filename: string, rows: string[][]): void {
  const header = rows[0];
  const body = rows.slice(1);
  const escape = (v: string) => {
    const s = String(v ?? "");
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };
  const csv = [header, ...body].map((r) => r.map(escape).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({ expenses, fixedPayments, subscriptions, savingsGoals }: ExportButtonProps) {
  function handleExport() {
    // gastos.csv
    downloadCsv("gastos.csv", [
      ["Título", "Importe", "Fecha", "Notas"],
      ...expenses.map((e) => [e.title, String(e.amount), e.expense_date, e.notes ?? ""]),
    ]);

    // pagos-fijos.csv
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

    // suscripciones.csv
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

    // objetivos.csv
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

  return (
    <button
      type="button"
      onClick={handleExport}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-brown transition hover:bg-sand active:scale-[0.97]"
    >
      <Download className="h-3.5 w-3.5 text-muted" aria-hidden />
      Exportar datos
    </button>
  );
}
