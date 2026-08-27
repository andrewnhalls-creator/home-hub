"use client";

import { useActionState, useEffect, useState } from "react";
import { Bank, PencilSimple } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { formatCurrency, formatDate } from "@/lib/format";
import { setAccountBalance, type AccountActionState } from "@/app/(app)/finanzas/accountActions";

export interface AccountBalance {
  id: string;
  name: string;
  opening_balance: number | null;
  opening_date: string | null;
  current_balance: number | null;
}

interface AccountsCardProps {
  accounts: AccountBalance[];
}

const initialState: AccountActionState = {};

function BalanceForm({
  account,
  onSuccess,
  onCancel,
}: {
  account: AccountBalance;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [state, formAction, isPending] = useActionState(setAccountBalance, initialState);

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="accountId" value={account.id} />
      <Input
        label="Saldo actual (€)"
        name="amount"
        type="number"
        inputMode="decimal"
        step="0.01"
        min="0"
        required
        defaultValue={account.current_balance ?? undefined}
        placeholder="0,00"
      />
      <p className="text-xs text-muted">
        A partir de hoy el saldo estimado se moverá solo: sumará los ingresos
        marcados como recibidos y restará los gastos, pagos y aportaciones
        cargados a esta cuenta.
      </p>
      {state.error && <p className="text-sm text-danger">{state.error}</p>}
      <div className="mt-1 flex gap-3">
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

/** Estimated balance per account label, anchored on the last "saldo a fecha". */
export function AccountsCard({ accounts }: AccountsCardProps) {
  const { showToast } = useToast();
  const [editing, setEditing] = useState<AccountBalance | null>(null);

  if (accounts.length === 0) return null;

  return (
    <>
      <Card>
        <div className="mb-2 flex items-center gap-2">
          <Bank className="h-4 w-4 text-terracotta" aria-hidden />
          <h2 className="text-sm font-semibold text-brown">Cuentas</h2>
        </div>
        <ul className="flex flex-col">
          {accounts.map((account) => (
            <li key={account.id}>
              <button
                type="button"
                onClick={() => setEditing(account)}
                className="flex w-full items-center justify-between gap-3 rounded-lg px-1 py-2 text-left transition hover:bg-sand"
                aria-label={`Actualizar saldo de ${account.name}`}
              >
                <div className="min-w-0">
                  <p className="text-sm text-brown">{account.name}</p>
                  {account.opening_date && (
                    <p className="text-[11px] text-muted">
                      Desde el {formatDate(account.opening_date)}
                    </p>
                  )}
                </div>
                <span className="flex shrink-0 items-center gap-1.5">
                  <span className="text-sm font-bold text-brown tabular-nums">
                    {account.current_balance != null
                      ? formatCurrency(Number(account.current_balance))
                      : "Saldo por indicar"}
                  </span>
                  <PencilSimple className="h-3.5 w-3.5 text-muted" aria-hidden />
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      <Modal
        isOpen={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Saldo de ${editing.name}` : "Saldo"}
      >
        {editing && (
          <BalanceForm
            account={editing}
            onSuccess={() => {
              setEditing(null);
              showToast("Saldo actualizado");
            }}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </>
  );
}
