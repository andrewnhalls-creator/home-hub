"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp, type AuthActionState } from "@/app/auth/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthActionState = {};

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signUp, initialState);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-brown">Crear cuenta</h1>
        <p className="mt-1 text-sm text-muted">
          Organiza tu casa, tus tareas y tus finanzas en un solo lugar.
        </p>

        {state.info ? (
          <p className="mt-6 rounded-xl border border-success/30 bg-card p-4 text-sm text-brown">
            {state.info}
          </p>
        ) : (
          <form action={formAction} className="mt-6 flex flex-col gap-4">
            <Input
              label="Tu nombre"
              name="displayName"
              autoComplete="name"
              required
              error={state.fieldErrors?.displayName}
            />
            <Input
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="email"
              required
              error={state.fieldErrors?.email}
            />
            <Input
              label="Contraseña"
              name="password"
              type="password"
              autoComplete="new-password"
              helperText="Al menos 8 caracteres."
              required
              error={state.fieldErrors?.password}
            />

            {state.error && <p className="text-sm text-danger">{state.error}</p>}

            <Button type="submit" isLoading={isPending} className="mt-2">
              Crear mi cuenta
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="font-medium text-terracotta">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
