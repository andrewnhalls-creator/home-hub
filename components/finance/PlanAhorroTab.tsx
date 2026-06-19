"use client";

import { useState } from "react";
import { CaretDown, CaretUp } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/format";
import type { SavingsGoal } from "@/lib/types";

interface PlanAhorroTabProps {
  goals: SavingsGoal[];
}

const PHASE_DATA = [
  {
    label: "Fase 1",
    subtitle: "ago – dic 2026",
    startMonth: new Date(2026, 7, 1),
    endMonth: new Date(2026, 11, 31),
    emergencia: 600,
    compras: 300,
    amortizacion: 500,
    sinAsignar: 73.56,
  },
  {
    label: "Fase 2",
    subtitle: "desde ene 2027 (casa amueblada)",
    startMonth: new Date(2027, 0, 1),
    endMonth: new Date(2099, 0, 1),
    emergencia: 700,
    compras: 100,
    amortizacion: 673.56,
    sinAsignar: 0,
  },
  {
    label: "Fase 3",
    subtitle: "cuando fondo emergencia ≥ 16.496 €",
    startMonth: null,
    endMonth: null,
    emergencia: 200,
    compras: 100,
    amortizacion: 1173.56,
    sinAsignar: 0,
  },
];

const EMERGENCY_TARGET_3M = 8248;
const EMERGENCY_TARGET_6M = 16496;
const COMPRAS_TARGET = 4000;
const SURPLUS = 1473.56;

function currentPhaseIndex(goals: SavingsGoal[]): number {
  const emergencia = goals.find((g) => g.name === "Fondo de emergencia");
  if (emergencia && Number(emergencia.current_amount) >= EMERGENCY_TARGET_6M) return 2;
  const now = new Date();
  if (now >= new Date(2027, 0, 1)) return 1;
  return 0;
}

function ProgressBar({
  value,
  max,
  milestone,
  milestoneLabel,
  colorClass = "bg-sage",
}: {
  value: number;
  max: number;
  milestone?: number;
  milestoneLabel?: string;
  colorClass?: string;
}) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const milestonePct = milestone && max > 0 ? Math.min((milestone / max) * 100, 100) : null;

  return (
    <div className="relative">
      <div className="h-2 w-full overflow-visible rounded-full bg-border">
        <div
          className={cn("h-full rounded-full transition-all", colorClass)}
          style={{ width: `${pct}%` }}
        />
        {milestonePct !== null && (
          <div
            className="absolute top-1/2 h-3.5 w-0.5 -translate-y-1/2 rounded-full bg-amber/70"
            style={{ left: `${milestonePct}%` }}
            title={milestoneLabel}
          />
        )}
      </div>
    </div>
  );
}

function GoalCard({
  label,
  current,
  target,
  monthlyAllocation,
  notes,
  children,
}: {
  label: string;
  current: number;
  target: number | null;
  monthlyAllocation: number;
  notes?: string | null;
  children?: React.ReactNode;
}) {
  const hasTarget = target !== null && target > 0;
  const pct = hasTarget ? Math.min((current / target!) * 100, 100) : null;

  return (
    <Card variant="subtle">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-brown">{label}</p>
        <span className="shrink-0 rounded-full bg-terracotta/10 px-2 py-0.5 text-xs font-medium text-terracotta tabular-nums">
          +{formatCurrency(monthlyAllocation)}/mes
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div>
          <p className="text-[11px] text-muted">Acumulado</p>
          <p className="text-base font-bold text-sage tabular-nums">{formatCurrency(current)}</p>
        </div>
        {hasTarget ? (
          <div>
            <p className="text-[11px] text-muted">Objetivo</p>
            <p className="text-base font-bold text-brown tabular-nums">{formatCurrency(target!)}</p>
          </div>
        ) : (
          <div>
            <p className="text-[11px] text-muted">Sin objetivo fijo</p>
            <p className="text-sm text-muted">Aportaciones periódicas</p>
          </div>
        )}
      </div>

      {children}

      {hasTarget && pct !== null && (
        <div className="mt-3">
          <ProgressBar value={current} max={target!} />
          <p className="mt-1 text-right text-xs text-muted">{Math.round(pct)}%</p>
        </div>
      )}

      {notes && <p className="mt-2 text-xs text-muted">{notes}</p>}
    </Card>
  );
}

export function PlanAhorroTab({ goals }: PlanAhorroTabProps) {
  const [showNotes, setShowNotes] = useState(false);

  const phaseIdx = currentPhaseIndex(goals);
  const phase = PHASE_DATA[phaseIdx];
  const nextPhase = PHASE_DATA[phaseIdx + 1] ?? null;

  const emergencia = goals.find((g) => g.name === "Fondo de emergencia");
  const compras = goals.find((g) => g.name === "Fondo compras casa");
  const amortizacion = goals.find((g) => g.name === "Amortización anticipada hipoteca");

  const emergenciaAmount = Number(emergencia?.current_amount ?? 0);
  const comprasAmount = Number(compras?.current_amount ?? 0);
  const amortizacionAmount = Number(amortizacion?.current_amount ?? 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Phase indicator */}
      <div className="rounded-[var(--radius-xl)] border border-terracotta/20 bg-terracotta/[0.07] p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-terracotta">
              {phase.label} activa
            </p>
            <p className="mt-0.5 text-sm text-brown">{phase.subtitle}</p>
          </div>
          <p className="shrink-0 text-sm font-bold text-brown tabular-nums">
            {formatCurrency(SURPLUS)}/mes
          </p>
        </div>

        {/* Allocation table */}
        <div className="mt-3 flex flex-col gap-1.5 border-t border-border pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Fondo de emergencia</span>
            <span className="font-semibold text-sage tabular-nums">{formatCurrency(phase.emergencia)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Compras para la casa</span>
            <span className="font-semibold text-brown tabular-nums">{formatCurrency(phase.compras)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Amortización hipoteca</span>
            <span className="font-semibold text-brown tabular-nums">{formatCurrency(phase.amortizacion)}</span>
          </div>
          {phase.sinAsignar > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Sin asignar</span>
              <span className="font-semibold text-muted/60 tabular-nums">{formatCurrency(phase.sinAsignar)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Fund cards */}
      <GoalCard
        label="Fondo de emergencia"
        current={emergenciaAmount}
        target={EMERGENCY_TARGET_6M}
        monthlyAllocation={phase.emergencia}
        notes="Objetivo: 6 meses de gastos esenciales"
      >
        {/* Dual milestone bar */}
        <div className="mt-3">
          <ProgressBar
            value={emergenciaAmount}
            max={EMERGENCY_TARGET_6M}
            milestone={EMERGENCY_TARGET_3M}
            milestoneLabel="Hito 3 meses (8.248 €)"
          />
          <div className="mt-1.5 flex justify-between text-[11px] text-muted">
            <span>0 €</span>
            <span>3 meses</span>
            <span>6 meses</span>
          </div>
        </div>
      </GoalCard>

      <GoalCard
        label="Fondo compras casa"
        current={comprasAmount}
        target={COMPRAS_TARGET}
        monthlyAllocation={phase.compras}
        notes="Mobiliario y electrodomésticos · importe provisional"
      />

      <GoalCard
        label="Amortización anticipada hipoteca"
        current={amortizacionAmount}
        target={null}
        monthlyAllocation={phase.amortizacion}
        notes="Sin comisión por amortización anticipada (0%)"
      />

      {/* Next phase preview */}
      {nextPhase && (
        <Card variant="subtle">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Próxima fase — {nextPhase.label}
          </p>
          <p className="mt-0.5 text-xs text-muted/70">{nextPhase.subtitle}</p>
          <div className="mt-2 flex flex-col gap-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted">Emergencia</span>
              <span className="text-brown tabular-nums">{formatCurrency(nextPhase.emergencia)}/mes</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">Compras casa</span>
              <span className="text-brown tabular-nums">{formatCurrency(nextPhase.compras)}/mes</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted">Amortización</span>
              <span className="text-brown tabular-nums">{formatCurrency(nextPhase.amortizacion)}/mes</span>
            </div>
          </div>
        </Card>
      )}

      {/* Mortgage prepayment guidance */}
      <div className="rounded-[var(--radius-xl)] border border-border bg-white/[0.04] p-4">
        <button
          type="button"
          onClick={() => setShowNotes((p) => !p)}
          className="flex w-full items-center justify-between gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          aria-expanded={showNotes}
        >
          <p className="text-sm font-semibold text-brown">Guía de amortización anticipada</p>
          {showNotes
            ? <CaretUp className="h-4 w-4 shrink-0 text-muted" aria-hidden />
            : <CaretDown className="h-4 w-4 shrink-0 text-muted" aria-hidden />}
        </button>
        {showNotes && (
          <ul className="mt-3 flex flex-col gap-2 text-xs text-muted">
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-terracotta">•</span>
              Amortizar cuanto antes: el interés corre sobre el saldo pendiente — cada euro pagado hoy ahorra intereses futuros.
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-terracotta">•</span>
              Elegir «reducir plazo» en lugar de «reducir cuota» maximiza el ahorro total en intereses.
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-terracotta">•</span>
              Los pagos anticipados durante el período fijo (2,90%) también reducen el principal sobre el que se aplicará Euríbor +1,34% cuando cambie el tipo.
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 shrink-0 text-amber">⚠</span>
              Pendiente: confirmar con el banco el proceso de solicitud y el importe mínimo por operación.
            </li>
          </ul>
        )}
      </div>
    </div>
  );
}
