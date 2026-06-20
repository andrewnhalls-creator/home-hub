"use client";

import { useActionState, useEffect, useState, type ReactNode } from "react";
import { Plus, CaretDown, CaretUp, Calculator } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { formatCurrency } from "@/lib/format";
import { addContribution, type FinanceFormState } from "@/app/(app)/finanzas/actions";
import { useToast } from "@/components/ui/Toast";
import type { Mortgage, SavingsGoal } from "@/lib/types";

interface PlanAhorroTabProps {
  goals: SavingsGoal[];
  mortgages?: Mortgage[];
}

// Stage 4 fixed monthly allocations
const PLAN_CONFIG = [
  {
    key: "emergencia",
    label: "Fondo de emergencia",
    goalName: "Fondo de emergencia",
    monthly: 400,
  },
  {
    key: "inmobiliario",
    label: "Inmobiliario",
    goalName: "Inmobiliario",
    monthly: 300,
  },
  {
    key: "amortizacion",
    label: "Amortización de hipoteca",
    goalName: "Amortización anticipada hipoteca",
    monthly: 700,
  },
] as const;

const BANK_ACCOUNT_OPTIONS = [
  { value: "ING", label: "ING" },
  { value: "BBVA", label: "BBVA" },
  { value: "Revolut", label: "Revolut" },
];

// Months from the current month through December (inclusive)
function getMonthsLeftInYear(): number {
  return 12 - new Date().getMonth();
}

function endOfYearLabel(): string {
  return `dic. ${new Date().getFullYear()}`;
}

// ---- Contribution form ----

const initialState: FinanceFormState = {};

function AddFundsForm({
  goalId,
  planLabel,
  onSuccess,
  onCancel,
}: {
  goalId: string;
  planLabel: string;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const boundAction = addContribution.bind(null, goalId);
  const [state, formAction, isPending] = useActionState(boundAction, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <p className="text-sm text-muted">{planLabel}</p>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Importe (€)"
          name="amount"
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0.01"
          required
          error={state.fieldErrors?.amount}
          placeholder="0,00"
        />
        <Select
          label="Cuenta bancaria"
          name="bankAccount"
          placeholder="Sin cuenta"
          options={BANK_ACCOUNT_OPTIONS}
        />
      </div>
      <Input
        label="Fecha"
        name="contributionDate"
        type="date"
        defaultValue={new Date().toISOString().slice(0, 10)}
      />
      <Textarea label="Notas" name="notes" />
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" isLoading={isPending}>
          Guardar
        </Button>
      </div>
    </form>
  );
}

// ---- Plan card ----

function PlanCard({
  label,
  monthly,
  currentAmount,
  monthsLeft,
  goal,
  onAddFunds,
}: {
  label: string;
  monthly: number;
  currentAmount: number;
  monthsLeft: number;
  goal: SavingsGoal | undefined;
  onAddFunds: () => void;
}) {
  const projected = monthly * monthsLeft;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-brown">{label}</p>
        <span className="shrink-0 rounded-full bg-terracotta/10 px-2.5 py-1 text-xs font-semibold text-terracotta tabular-nums">
          {formatCurrency(monthly)}/mes
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-xs text-muted">Acumulado</p>
          <p className="text-base font-bold text-sage tabular-nums">{formatCurrency(currentAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Proyectado año</p>
          <p className="text-base font-bold text-brown tabular-nums">+{formatCurrency(projected)}</p>
        </div>
        <div>
          <p className="text-xs text-muted">Meses hasta {endOfYearLabel()}</p>
          <p className="text-base font-bold text-brown tabular-nums">{monthsLeft}</p>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={onAddFunds}
        disabled={!goal}
      >
        <Plus className="h-4 w-4" aria-hidden />
        Añadir fondos
      </Button>
    </Card>
  );
}

// ---- Savings Simulator ----

type SimFund = "emergencia" | "inmobiliario";
type SimMode = "monthly" | "date";

const SIM_CONFIG = {
  emergencia: { label: "Emergencia", target: 16496 },
  inmobiliario: { label: "Inmobiliario", target: 4000 },
} as const;

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
  inmobiliarioAmount,
}: {
  emergenciaAmount: number;
  inmobiliarioAmount: number;
}) {
  const [fund, setFund] = useState<SimFund>("emergencia");
  const [mode, setMode] = useState<SimMode>("monthly");
  const [monthlyInput, setMonthlyInput] = useState("");
  const [targetDateInput, setTargetDateInput] = useState("");

  const current = fund === "emergencia" ? emergenciaAmount : inmobiliarioAmount;
  const { label: fundLabel, target } = SIM_CONFIG[fund];
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
      const monthsAvailable = Math.max(
        1,
        (targetDate.getFullYear() - now.getFullYear()) * 12 + (targetDate.getMonth() - now.getMonth()),
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

      <div className="mt-3 flex gap-2">
        {(["emergencia", "inmobiliario"] as SimFund[]).map((f) => (
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
            {SIM_CONFIG[f].label}
          </button>
        ))}
      </div>

      <p className="mt-2 text-xs text-muted">
        {fundLabel} · Acumulado: <span className="font-medium text-brown">{formatCurrency(current)}</span>
        {" · "}Objetivo: <span className="font-medium text-brown">{formatCurrency(target)}</span>
      </p>

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
            placeholder="400"
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
  const [balance, setBalance] = useState(mortgage ? String(Math.round(Number(mortgage.current_balance))) : "");
  const [rate, setRate] = useState(mortgage?.interest_rate != null ? String(mortgage.interest_rate) : "");
  const [monthly, setMonthly] = useState(mortgage ? String(mortgage.monthly_payment) : "");
  const [lump, setLump] = useState("");

  const P = parseFloat(balance.replace(",", "."));
  const annualRate = parseFloat(rate.replace(",", "."));
  const M = parseFloat(monthly.replace(",", "."));
  const L = parseFloat(lump.replace(",", "."));

  let result: ReactNode = null;

  if (
    !isNaN(P) && P > 0 &&
    !isNaN(annualRate) && annualRate > 0 &&
    !isNaN(M) && M > 0 &&
    !isNaN(L) && L > 0 && L < P &&
    M > (annualRate / 12 / 100) * P
  ) {
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
      <p className="mt-1 text-xs text-muted">
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

      <p className="mt-2 flex items-start gap-1 text-xs text-muted">
        <span className="text-amber">⚠</span>
        Resultado orientativo · elige «reducir plazo» en el banco para maximizar el ahorro.
      </p>
    </div>
  );
}

// ---- Mortgage reference table ----

const MORTGAGE_SCENARIOS = [
  { extra: 100, years: 26.3 },
  { extra: 200, years: 23.4 },
  { extra: 300, years: 21.1 },
  { extra: 500, years: 17.5 },
  { extra: 1000, years: 12.8 },
];

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
          <p className="mb-2 text-xs text-muted">
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
          <p className="mt-2 flex items-start gap-1 text-xs text-muted">
            <span className="text-amber">⚠</span>
            Confirmar con el banco importe mínimo por amortización y proceso de solicitud.
          </p>
        </div>
      )}
    </div>
  );
}

// ---- Amortisation guide ----

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
            Los pagos anticipados durante el período fijo también reducen el principal sobre el que se aplicará Euríbor cuando cambie el tipo.
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

// ---- Main component ----

export function PlanAhorroTab({ goals, mortgages = [] }: PlanAhorroTabProps) {
  const activeMortgage = mortgages.find((m) => m.status === "activa" && !m.deleted_at) ?? null;
  const monthsLeft = getMonthsLeftInYear();

  const [addFundsFor, setAddFundsFor] = useState<(typeof PLAN_CONFIG)[number] | null>(null);
  const { showToast } = useToast();

  const goalByName = new Map(goals.map((g) => [g.name, g]));

  const emergenciaGoal =
    goalByName.get("Fondo de emergencia");
  const inmobiliarioGoal = goalByName.get("Inmobiliario");
  const amortizacionGoal =
    goalByName.get("Amortización anticipada hipoteca");

  const goalByKey: Record<string, SavingsGoal | undefined> = {
    emergencia: emergenciaGoal,
    inmobiliario: inmobiliarioGoal,
    amortizacion: amortizacionGoal,
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Plan cards */}
      {PLAN_CONFIG.map((plan) => {
        const goal = goalByKey[plan.key];
        return (
          <PlanCard
            key={plan.key}
            label={plan.label}
            monthly={plan.monthly}
            currentAmount={Number(goal?.current_amount ?? 0)}
            monthsLeft={monthsLeft}
            goal={goal}
            onAddFunds={() => setAddFundsFor(plan)}
          />
        );
      })}

      {/* Savings simulator */}
      <SavingsSimulator
        emergenciaAmount={Number(emergenciaGoal?.current_amount ?? 0)}
        inmobiliarioAmount={Number(inmobiliarioGoal?.current_amount ?? 0)}
      />

      {/* Mortgage amortisation calculator */}
      <MortgageOverpaymentCalculator mortgage={activeMortgage} />

      {/* Reference table */}
      <MortgageSimulator />

      {/* Guide */}
      <AmortizacionGuide />

      {/* Add funds modal */}
      <Modal
        isOpen={!!addFundsFor}
        onClose={() => setAddFundsFor(null)}
        title="Añadir fondos"
      >
        {addFundsFor && goalByKey[addFundsFor.key] && (
          <AddFundsForm
            goalId={goalByKey[addFundsFor.key]!.id}
            planLabel={addFundsFor.label}
            onSuccess={() => {
              setAddFundsFor(null);
              showToast("Fondos añadidos");
            }}
            onCancel={() => setAddFundsFor(null)}
          />
        )}
      </Modal>
    </div>
  );
}

