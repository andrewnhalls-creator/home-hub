"use client";

import { useActionState } from "react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { changePassword, changeEmail } from "@/app/(app)/ajustes/cuenta/actions";
import type { AccountActionState } from "@/app/(app)/ajustes/cuenta/actions";

const initialState: AccountActionState = {};

function ChangePasswordForm() {
  const [state, formAction, pending] = useActionState(changePassword, initialState);

  return (
    <Card>
      <CardTitle>Cambiar contraseña</CardTitle>
      <CardDescription>Elige una contraseña de al menos 8 caracteres.</CardDescription>

      <form action={formAction} noValidate className="mt-4 flex flex-col gap-4">
        <Input
          label="Nueva contraseña"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          error={state.fieldErrors?.password}
          aria-describedby={state.fieldErrors?.password ? "pwd-error" : undefined}
          aria-invalid={!!state.fieldErrors?.password}
        />
        <Input
          label="Repetir contraseña"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          error={state.fieldErrors?.confirm}
          aria-describedby={state.fieldErrors?.confirm ? "confirm-error" : undefined}
          aria-invalid={!!state.fieldErrors?.confirm}
        />

        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        {state.success && <p className="text-sm text-sage">{state.success}</p>}

        <Button type="submit" disabled={pending} isLoading={pending}>
          Guardar contraseña
        </Button>
      </form>
    </Card>
  );
}

function ChangeEmailForm({ currentEmail }: { currentEmail: string }) {
  const [state, formAction, pending] = useActionState(changeEmail, initialState);

  return (
    <Card>
      <CardTitle>Cambiar correo electrónico</CardTitle>
      <CardDescription>
        Correo actual: <span className="font-medium text-brown">{currentEmail}</span>
      </CardDescription>

      <form action={formAction} noValidate className="mt-4 flex flex-col gap-4">
        <Input
          label="Nuevo correo electrónico"
          name="email"
          type="email"
          autoComplete="email"
          required
          error={state.fieldErrors?.email}
          aria-describedby={state.fieldErrors?.email ? "email-error" : undefined}
          aria-invalid={!!state.fieldErrors?.email}
        />

        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        {state.success && (
          <p className="text-sm text-sage">{state.success}</p>
        )}

        <Button type="submit" disabled={pending} isLoading={pending}>
          Cambiar correo
        </Button>
      </form>
    </Card>
  );
}

export function CuentaView({ email }: { email: string }) {
  return (
    <div className="flex flex-col gap-4">
      <ChangePasswordForm />
      <ChangeEmailForm currentEmail={email} />
    </div>
  );
}
