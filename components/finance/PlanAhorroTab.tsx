"use client";

import { useState, type ReactNode } from "react";
import { CaretDown, CaretUp, Calculator } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/format";
import type { Mortgage, SavingsGoal } from "@/lib/types";

interface PlanAhorroTabProps {
  goals: SavingsGoal[];
  mortgages?: Mortgage[];
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

// Approximate mortgage reference: 175 000 € · 2,90 % · 30 años · cuota 729 €/mes
// Precomputed scenarios (extra €/mes → plazo total en años)
const MORTGAGE_SCENARIOS = [
  { extra: 100, years: 26.3 },
  { extra: 200, years: 23.4 },
  { extra: 300, years: 21.1 },
  { extra: 500, years: 17.5 },
  { extra: 1000, years: 12.8 },
];

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
  children?: ReactNode;
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

// ---- Savings Simulator ----

type SimFund = "emergencia" | "compras";
type SimMode = "monthly" | "date";

function formatMonths(months: number): string {
  if (months <= 0) return "¡Ya has llegado al objetivo!";
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts: string[] = [];
  if (y > 0) parts.push(`${y} año${y !== 1 ? "s" : ""}`);
  if (m > 0) parts.push(`${m} mes${m !== 1 ? "es" : ""}`);
  return parts.join(" y ");
}

function addMonthsToDate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
}

function SavingsSimulator({
  emergenciaAmount,
  comprasAmount,
}: {
  emergenciaAmount: number;
  comprasAmount: number;
}) {
  const [fund, setFund] = useState<SimFund>("emergencia");
  const [mode, setMode] = useState<SimMode>("monthly");
  const [monthlyInput, setMonthlyInput] = useState("");
  const [targetDateInput, setTargetDateInput] = useState("");

  const current = fund === "emergencia" ? emergenciaAmount : comprasAmount;
  const target = fund === "emergencia" ? EMERGENCY_TARGET_6M : COMPRAS_TARGET;
  const remaining = Math.max(0, target - current);

  let result: ReactNode = null;

  if (mode === "monthly") {
    const monthly = parseFloat(monthlyInput.replace(",", "."));
    if (!isNaN(monthly) && monthly > 0) {
      if (remaining <= 0) {
        result = <p className="text-sm font-semibold text-sage">¡Ya has alcanzado el objetivo!</p>;
      } else {
        const months = Math.ceil(remaining / monthly);
        result = (
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted">
              Aportando <span className="font-semibold text-brown">{formatCurrency(monthly)}/mes</span> llegarás en:
            </p>
            <p className="text-base font-bold text-terracotta tabular-nums">{formatMonths(months)}</p>
            <p className="text-xs text-muted">Fecha estimada: {addMonthsToDate(months)}</p>
            <p className="text-xs text-muted">Quedan {formatCurrency(remaining)} por alcanzar</p>
          </div>
        );
      }
    }
  } else {
    if (targetDateInput) {
      const targetDate = new Date(targetDateInput);
      const now = new Date();
      const monthsAvailable = Math.max(1,
        (targetDate.getFullYear() - now.getFullYear()) * 12 +
        (targetDate.getMonth() - now.getMonth()),
      );
      if (remaining <= 0) {
        result = <p className="text-sm font-semibold text-sage">¡Ya has alcanzado el objetivo!</p>;
      } else {
        const needed = Math.ceil((remaining / monthsAvailable) * 100) / 100;
        result = (
          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted">
              Para llegar en <span className="font-semibold text-brown">{formatMonths(monthsAvailable)}</span> necesitas aportar:
            </p>
            <p className="text-base font-bold text-terracotta tabular-nums">{formatCurrency(needed)}/mes</p>
            <p className="text-xs text-muted">Quedan {formatCurrency(remaining)} por alcanzar</p>
          </div>
        );
      }
    }
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-white/[0.04] p-4">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 shrink-0 text-terracotta" aria-hidden />
        <p className="text-sm font-semibold text-brown">Simulador de ahorro</p>
      </div>

      {/* Fund selector */}
      <div className="mt-3 flex gap-2">
        {(["emergencia", "compras"] as SimFund[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFund(f)}
            className={cn(
              "flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
              fund === f
                ? "border-terracotta/30 bg-terracotta/10 text-terracotta"
                : "border-border bg-white/[0.04] text-muted hover:bg-white/[0.08]",
            )}
          >
            {f === "emergencia" ? "Emergencia" : "Compras casa"}
          </button>
        ))}
      </div>

      <p className="mt-2 text-[11px] text-muted">
        Acumulado: <span className="font-medium text-brown">{formatCurrency(current)}</span>
        {" · "}Objetivo: <span className="font-medium text-brown">{formatCurrency(target)}</span>
      </p>

      {/* Mode toggle */}
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("monthly")}
          className={cn(
            "flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
            mode === "monthly"
              ? "border-terracotta/30 bg-terracotta/10 text-terracotta"
              : "border-border bg-white/[0.04] text-muted hover:bg-white/[0.08]",
          )}
        >
          ¿Cuándo llegaré?
        </button>
        <button
          type="button"
          onClick={() => setMode("date")}
          className={cn(
            "flex-1 rounded-xl border px-3 py-2 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
            mode === "date"
              ? "border-terracotta/30 bg-terracotta/10 text-terracotta"
              : "border-border bg-white/[0.04] text-muted hover:bg-white/[0.08]",
          )}
        >
          ¿Cuánto necesito?
        </button>
      </div>

      <div className="mt-3">
        {mode === "monthly" ? (
          <Input
            label="Aportación mensual (€)"
            name="sim-monthly"
            type="number"
            inputMode="decimal"
            step="10"
            min="1"
            placeholder="600"
            value={monthlyInput}
            onChange={(e) => setMonthlyInput(e.target.value)}
          />
        ) : (
          <Input
            label="Fecha objetivo"
            name="sim-date"
            type="date"
            value={targetDateInput}
            onChange={(e) => setTargetDateInput(e.target.value)}
          />
        )}
      </div>

      {result && (
        <div className="mt-3 rounded-xl border border-terracotta/20 bg-terracotta/[0.06] p-3">
          {result}
        </div>
      )}
    </div>
  );
}

// ---- Mortgage overpayment interactive calculator ----

function MortgageOverpaymentCalculator({ mortgage }: { mortgage: Mortgage | null }) {
  const [balance, setBalance] = useState(mortgage ? String(Math.round(mortgage.current_balance)) : "");
  const [rate, setRate] = useState(mortgage?.interest_rate != null ? String(mortgage.interest_rate) : "");
  const [monthly, setMonthly] = useState(mortgage ? String(mortgage.monthly_payment) : "");
  const [lump, setLump] = useState("");

  const P = parseFloat(balance.replace(",", "."));
  const annualRate = parseFloat(rate.replace(",", "."));
  const M = parseFloat(monthly.replace(",", "."));
  const L = parseFloat(lump.replace(",", "."));

  let result: ReactNode = null;

  if (!isNaN(P) && P > 0 && !isNaN(annualRate) && annualRate > 0 && !isNaN(M) && M > 0 && !isNaN(L) && L > 0 && L < P && M > (annualRate / 12 / 100) * P) {
    const r = annualRate / 12 / 100;
    const Nf = -Math.log(1 - (r * P) / M) / Math.log(1 + r);
    const newP = P - L;
    const Nf_new = newP > 0 ? -Math.log(1 - (r * newP) / M) / Math.log(1 + r) : 0;
    const monthsSaved = Math.round(Nf - Nf_new);
    const interestSaved = M * (Nf - Nf_new) - L;

    if (monthsSaved > 0 && interestSaved >= 0) {
      result = (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted">Tiempo ahorrado</p>
            <p className="text-sm font-bold text-sage tabular-nums">{formatMonths(monthsSaved)}</p>
          </div>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted">Interés ahorrado</p>
            <p className="text-sm font-bold text-terracotta tabular-nums">{formatCurrency(interestSaved)}</p>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-white/[0.04] p-4">
      <div className="flex items-center gap-2">
        <Calculator className="h-4 w-4 shrink-0 text-terracotta" aria-hidden />
        <p className="text-sm font-semibold text-brown">Amortizar hipoteca — calculadora</p>
      </div>
      <p className="mt-1 text-[11px] text-muted">
        Calcula el tiempo e interés que ahorras con un pago extraordinario
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2">
        <Input
          label="Saldo pendiente (€)"
          name="calc-balance"
          type="number"
          inputMode="decimal"
          step="1000"
          min="0"
          value={balance}
          onChange={(e) => setBalance(e.target.value)}
        />
        <Input
          label="Tipo de interés (%)"
          name="calc-rate"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          placeholder="2.90"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
        />
        <Input
          label="Cuota mensual (€)"
          name="calc-monthly"
          type="number"
          inputMode="decimal"
          step="1"
          min="0"
          value={monthly}
          onChange={(e) => setMonthly(e.target.value)}
        />
        <Input
          label="Amortizar ahora (€)"
          name="calc-lump"
          type="number"
          inputMode="decimal"
          step="500"
          min="0"
          placeholder="5000"
          value={lump}
          onChange={(e) => setLump(e.target.value)}
        />
      </div>

      {result && (
        <div className="mt-3 rounded-xl border border-sage/20 bg-sage/[0.06] p-3">
          {result}
        </div>
      )}

      <p className="mt-2 flex items-start gap-1 text-[11px] text-muted">
        <span className="text-amber">⚠</span>
        Resultado orientativo · elige «reducir plazo» en el banco para maximizar el ahorro.
      </p>
    </div>
  );
}

// ---- Mortgage prepayment reference table ----

function MortgageSimulator() {
  const [showTable, setShowTable] = useState(false);

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-white/[0.04] p-4">
      <button
        type="button"
        onClick={() => setShowTable((p) => !p)}
        className="flex w-full items-center justify-between gap-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        aria-expanded={showTable}
      >
        <p className="text-sm font-semibold text-brown">Amortización anticipada — referencia</p>
        {showTable
          ? <CaretUp className="h-4 w-4 shrink-0 text-muted" aria-hidden />
          : <CaretDown className="h-4 w-4 shrink-0 text-muted" aria-hidden />}
      </button>
      {showTable && (
        <div className="mt-3 flex flex-col gap-0.5">
          <p className="mb-2 text-[11px] text-muted">
            Referencia aproximada · 175.000 € · 2,90 % fijo · 30 años · cuota base 729 €/mes
          </p>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
            <span className="font-medium text-muted">Extra/mes</span>
            <span className="font-medium text-muted">Plazo total</span>
            <span className="font-medium text-muted">Años ganados</span>
            {MORTGAGE_SCENARIOS.map(({ extra, years }) => (
              <>
                <span key={`e-${extra}`} className="tabular-nums text-brown">+{formatCurrency(extra)}</span>
                <span key={`y-${extra}`} className="tabular-nums text-brown">{years} años</span>
                <span key={`s-${extra}`} className="tabular-nums text-sage">{(30 - years).toFixed(1)} menos</span>
              </>
            ))}
          </div>
          <p className="mt-2 flex items-start gap-1 text-[11px] text-muted">
            <span className="text-amber">⚠</span>
            Confirmar con el banco importe mínimo por amortización y proceso de solicitud.
          </p>
        </div>
      )}
    </div>
  );
}

// ---- Mortgage prepayment guidance ----

function AmortizacionGuide() {
  const [showNotes, setShowNotes] = useState(false);

  return (
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
            Los pagos anticipados durante el período fijo (2,90 %) también reducen el principal sobre el que se aplicará Euríbor +1,34 % cuando cambie el tipo.
          </li>
          <li className="flex gap-2">
            <span className="mt-0.5 shrink-0 text-amber">⚠</span>
            Pendiente: confirmar con el banco el proceso de solicitud y el importe mínimo por operación.
          </li>
        </ul>
      )}
    </div>
  );
}

export function PlanAhorroTab({ goals, mortgages = [] }: PlanAhorroTabProps) {
  const activeMortgage = mortgages.find((m) => m.status === "activa" && !m.deleted_at) ?? null;
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
        notes="Sin comisión por amortización anticipada (0 %)"
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

      {/* Savings simulator */}
      <SavingsSimulator emergenciaAmount={emergenciaAmount} comprasAmount={comprasAmount} />

      {/* Mortgage overpayment interactive calculator */}
      <MortgageOverpaymentCalculator mortgage={activeMortgage} />

      {/* Mortgage simulator reference table */}
      <MortgageSimulator />

      {/* Mortgage prepayment guidance */}
      <AmortizacionGuide />
    </div>
  );
}
