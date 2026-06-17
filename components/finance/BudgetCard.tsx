"use client";

import { useState, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/format";
import { updateMonthlyBudget } from "@/app/(app)/finanzas/actions";

interface BudgetCardProps {
  monthlyBudget: number | null;
  spent: number;
}

export function BudgetCard({ monthlyBudget, spent }: BudgetCardProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(monthlyBudget != null ? String(monthlyBudget) : "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const pct = monthlyBudget && monthlyBudget > 0 ? Math.min((spent / monthlyBudget) * 100, 100) : 0;
  const barColor =
    pct >= 100 ? "bg-danger" : pct >= 80 ? "bg-amber-400" : "bg-sage";
  const labelColor =
    pct >= 100 ? "text-danger" : pct >= 80 ? "text-amber-600" : "text-sage";

  function handleSave() {
    const parsed = value.trim() === "" ? null : parseFloat(value.replace(",", "."));
    if (parsed !== null && (isNaN(parsed) || parsed < 0)) {
      setError("Importe no válido.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await updateMonthlyBudget(parsed);
      if (result.error) {
        setError(result.error);
      } else {
        setEditing(false);
      }
    });
  }

  if (editing) {
    return (
      <Card>
        <p className="mb-3 text-sm font-semibold text-brown">Presupuesto mensual de gastos variables</p>
        <div className="flex items-end gap-2">
          <Input
            label="Importe (€)"
            name="budget"
            type="number"
            step="0.01"
            min="0"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            error={error ?? undefined}
            className="flex-1"
            autoFocus
          />
          <button
            type="button"
            aria-label="Guardar"
            disabled={isPending}
            onClick={handleSave}
            className="mb-[2px] flex h-11 w-11 items-center justify-center rounded-full bg-terracotta text-cream disabled:opacity-50"
          >
            <Check className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Cancelar"
            onClick={() => { setEditing(false); setError(null); setValue(monthlyBudget != null ? String(monthlyBudget) : ""); }}
            className="mb-[2px] flex h-11 w-11 items-center justify-center rounded-full border border-border text-muted"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </Card>
    );
  }

  if (monthlyBudget == null || monthlyBudget <= 0) {
    return (
      <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
        <Pencil className="h-4 w-4" aria-hidden />
        Establecer presupuesto mensual
      </Button>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-brown">Presupuesto mensual</p>
        <button
          type="button"
          aria-label="Editar presupuesto"
          onClick={() => setEditing(true)}
          className="flex h-9 w-9 items-center justify-center rounded-full text-muted hover:bg-sand"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold text-brown tabular-nums">{formatCurrency(spent)}</span>
        <span className="text-sm text-muted">de {formatCurrency(monthlyBudget)}</span>
      </div>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-border">
        <div
          className={`h-full rounded-full transition-all ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className={`mt-1.5 text-right text-xs font-semibold tabular-nums ${labelColor}`}>
        {Math.round(pct)}% utilizado
      </p>

      {pct >= 100 && (
        <p className="mt-1 text-xs text-danger">Presupuesto superado este mes.</p>
      )}
    </Card>
  );
}
