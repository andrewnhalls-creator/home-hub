"use client";

import { useState, useTransition } from "react";
import {
  Landmark,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency } from "@/lib/format";
import { MortgageForm } from "@/components/finance/MortgageForm";
import { MortgagePaymentForm } from "@/components/finance/MortgagePaymentForm";
import {
  upsertMortgage,
  deleteMortgage,
  addMortgagePayment,
  markMortgagePaymentPaid,
  deleteMortgagePayment,
} from "@/app/(app)/finanzas/mortgageActions";
import type { Mortgage, MortgagePayment } from "@/lib/types";

interface MortgageTabProps {
  mortgages: Mortgage[];
  payments: MortgagePayment[];
}

function progressPct(mortgage: Mortgage): number {
  const total = Number(mortgage.original_principal);
  if (total <= 0) return 0;
  const paid = total - Number(mortgage.current_balance);
  return Math.min(100, Math.max(0, (paid / total) * 100));
}

function yearsRemaining(mortgage: Mortgage): string | null {
  if (!mortgage.end_date) return null;
  const months =
    (new Date(mortgage.end_date).getFullYear() - new Date().getFullYear()) * 12 +
    (new Date(mortgage.end_date).getMonth() - new Date().getMonth());
  if (months <= 0) return "Finalizada";
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (years === 0) return `${rem} mes${rem !== 1 ? "es" : ""}`;
  if (rem === 0) return `${years} año${years !== 1 ? "s" : ""}`;
  return `${years} año${years !== 1 ? "s" : ""} y ${rem} mes${rem !== 1 ? "es" : ""}`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

interface MortgageCardProps {
  mortgage: Mortgage;
  payments: MortgagePayment[];
  onEdit: (m: Mortgage) => void;
  onDelete: (m: Mortgage) => void;
  onAddPayment: (m: Mortgage) => void;
}

function MortgageCard({ mortgage, payments, onEdit, onDelete, onAddPayment }: MortgageCardProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [, startTransition] = useTransition();
  const { showToast } = useToast();

  const mortgagePayments = payments
    .filter((p) => p.mortgage_id === mortgage.id)
    .sort((a, b) => b.due_date.localeCompare(a.due_date));

  const paidPayments = mortgagePayments.filter((p) => p.status === "pagado");
  const pendingPayment = mortgagePayments.find((p) => p.status === "pendiente");
  const pct = progressPct(mortgage);
  const remaining = yearsRemaining(mortgage);

  function handleMarkPaid(paymentId: string) {
    startTransition(async () => {
      const result = await markMortgagePaymentPaid(paymentId);
      if (result.error) showToast(result.error, "error");
      else showToast("Pago marcado como pagado.", "success");
    });
  }

  function handleDeletePayment(paymentId: string) {
    startTransition(async () => {
      const result = await deleteMortgagePayment(paymentId);
      if (result.error) showToast(result.error, "error");
      else showToast("Pago eliminado.", "success");
    });
  }

  return (
    <Card className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <CardTitle className="text-base">{mortgage.name}</CardTitle>
          {mortgage.lender && <p className="text-sm text-muted mt-0.5">{mortgage.lender}</p>}
        </div>
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Editar hipoteca"
            onClick={() => onEdit(mortgage)}
          >
            <Pencil size={15} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Eliminar hipoteca"
            onClick={() => onDelete(mortgage)}
            className="text-danger hover:text-danger"
          >
            <Trash2 size={15} />
          </Button>
        </div>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Amortizado</span>
          <span className="font-medium text-brown">{pct.toFixed(1)}%</span>
        </div>
        <ProgressBar value={pct} max={100} />
        <div className="flex justify-between text-xs text-muted">
          <span>{formatCurrency(Number(mortgage.original_principal) - Number(mortgage.current_balance))} pagados</span>
          <span>{formatCurrency(Number(mortgage.current_balance))} pendientes</span>
        </div>
      </div>

      {/* Key stats grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-background p-3">
          <p className="text-xs text-muted mb-0.5">Cuota mensual</p>
          <p className="text-sm font-semibold text-brown">{formatCurrency(Number(mortgage.monthly_payment))}</p>
        </div>
        <div className="rounded-xl bg-background p-3">
          <p className="text-xs text-muted mb-0.5">Tipo de interés</p>
          <p className="text-sm font-semibold text-brown">
            {mortgage.interest_rate != null ? `${Number(mortgage.interest_rate).toFixed(3)}%` : "—"}
          </p>
        </div>
        <div className="rounded-xl bg-background p-3">
          <p className="text-xs text-muted mb-0.5">Inicio</p>
          <p className="text-sm font-semibold text-brown">{formatDate(mortgage.start_date)}</p>
        </div>
        <div className="rounded-xl bg-background p-3">
          <p className="text-xs text-muted mb-0.5">Tiempo restante</p>
          <p className="text-sm font-semibold text-brown">{remaining ?? "—"}</p>
        </div>
      </div>

      {/* Día de pago + pagos realizados */}
      <div className="flex items-center justify-between text-sm text-muted border-t border-border pt-3">
        <span>
          {mortgage.payment_day ? `Día de pago: ${mortgage.payment_day}` : "Sin día de pago"}
        </span>
        <span>{paidPayments.length} pago{paidPayments.length !== 1 ? "s" : ""} realizados</span>
      </div>

      {/* Pending payment */}
      {pendingPayment && (
        <div className="flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <div>
            <p className="text-xs font-medium text-amber-800">Próximo pago</p>
            <p className="text-xs text-amber-700">{formatDate(pendingPayment.due_date)} · {formatCurrency(Number(pendingPayment.amount))}</p>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => handleMarkPaid(pendingPayment.id)}
            className="text-xs"
          >
            <CheckCircle2 size={14} className="mr-1" />
            Pagar
          </Button>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="flex-1"
          onClick={() => onAddPayment(mortgage)}
        >
          <Plus size={14} className="mr-1" />
          Registrar pago
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowHistory((v) => !v)}
          aria-expanded={showHistory}
        >
          Historial
          {showHistory ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
        </Button>
      </div>

      {/* Payment history */}
      {showHistory && (
        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <p className="text-xs font-medium text-muted uppercase tracking-wide">Historial de pagos</p>
          {mortgagePayments.length === 0 ? (
            <p className="text-sm text-muted">Aún no hay pagos registrados.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {mortgagePayments.map((p) => (
                <li key={p.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-brown">{formatDate(p.due_date)}</span>
                    <span className="ml-2 text-muted">{formatCurrency(Number(p.amount))}</span>
                    {p.principal_amount != null && (
                      <span className="ml-1 text-xs text-muted">
                        (capital {formatCurrency(Number(p.principal_amount))})
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-md ${
                        p.status === "pagado"
                          ? "bg-success/10 text-success"
                          : p.status === "pendiente"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-muted/10 text-muted"
                      }`}
                    >
                      {p.status === "pagado" ? "Pagado" : p.status === "pendiente" ? "Pendiente" : "Omitido"}
                    </span>
                    <button
                      type="button"
                      aria-label="Eliminar pago"
                      onClick={() => handleDeletePayment(p.id)}
                      className="text-muted hover:text-danger transition-colors p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </Card>
  );
}

export function MortgageTab({ mortgages, payments }: MortgageTabProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingMortgage, setEditingMortgage] = useState<Mortgage | null>(null);
  const [deletingMortgage, setDeletingMortgage] = useState<Mortgage | null>(null);
  const [addingPaymentFor, setAddingPaymentFor] = useState<Mortgage | null>(null);
  const [, startTransition] = useTransition();
  const { showToast } = useToast();

  const activeMortgages = mortgages.filter((m) => !m.deleted_at);

  function handleDeleteConfirm() {
    if (!deletingMortgage) return;
    startTransition(async () => {
      const result = await deleteMortgage(deletingMortgage.id);
      if (result.error) showToast(result.error, "error");
      else showToast("Hipoteca eliminada.", "success");
      setDeletingMortgage(null);
    });
  }

  if (activeMortgages.length === 0 && !isAddOpen) {
    return (
      <>
        <EmptyState
          icon={Landmark}
          title="Sin hipoteca registrada"
          description="Añade tu hipoteca para hacer seguimiento del saldo pendiente, cuota mensual e historial de pagos."
          action={
            <Button onClick={() => setIsAddOpen(true)}>
              <Plus size={16} className="mr-1.5" />
              Añadir hipoteca
            </Button>
          }
        />
        <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nueva hipoteca">
          <MortgageForm
            action={upsertMortgage}
            onSuccess={() => { setIsAddOpen(false); showToast("Hipoteca guardada.", "success"); }}
            onCancel={() => setIsAddOpen(false)}
          />
        </Modal>
      </>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-brown">Hipoteca</h2>
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
          <Plus size={14} className="mr-1" />
          Añadir
        </Button>
      </div>

      {activeMortgages.map((m) => (
        <MortgageCard
          key={m.id}
          mortgage={m}
          payments={payments}
          onEdit={setEditingMortgage}
          onDelete={setDeletingMortgage}
          onAddPayment={setAddingPaymentFor}
        />
      ))}

      {/* Add mortgage modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nueva hipoteca">
        <MortgageForm
          action={upsertMortgage}
          onSuccess={() => { setIsAddOpen(false); showToast("Hipoteca guardada.", "success"); }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      {/* Edit mortgage modal */}
      <Modal
        isOpen={!!editingMortgage}
        onClose={() => setEditingMortgage(null)}
        title="Editar hipoteca"
      >
        {editingMortgage && (
          <MortgageForm
            action={upsertMortgage}
            mortgage={editingMortgage}
            onSuccess={() => { setEditingMortgage(null); showToast("Hipoteca actualizada.", "success"); }}
            onCancel={() => setEditingMortgage(null)}
          />
        )}
      </Modal>

      {/* Add payment modal */}
      <Modal
        isOpen={!!addingPaymentFor}
        onClose={() => setAddingPaymentFor(null)}
        title="Registrar pago"
      >
        {addingPaymentFor && (
          <MortgagePaymentForm
            action={addMortgagePayment}
            mortgage={addingPaymentFor}
            onSuccess={() => { setAddingPaymentFor(null); showToast("Pago registrado.", "success"); }}
            onCancel={() => setAddingPaymentFor(null)}
          />
        )}
      </Modal>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={!!deletingMortgage}
        onClose={() => setDeletingMortgage(null)}
        title="Eliminar hipoteca"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-brown">
            ¿Eliminar <strong>{deletingMortgage?.name}</strong>? También se eliminarán todos sus pagos registrados.
            Esta acción no se puede deshacer fácilmente.
          </p>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setDeletingMortgage(null)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-1"
              onClick={handleDeleteConfirm}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
