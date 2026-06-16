"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signIn, type AuthActionState } from "@/app/auth/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthActionState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-brown">Entrar en Home Hub</h1>
        <p className="mt-1 text-sm text-muted">
          Organiza tu casa, tus tareas y tus finanzas en un solo lugar.
        </p>

        <form action={formAction} noValidate className="mt-6 flex flex-col gap-4">
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
            autoComplete="current-password"
            required
            error={state.fieldErrors?.password}
          />

          {state.error && <p className="text-sm text-danger">{state.error}</p>}

          <Button type="submit" isLoading={isPending} className="mt-2">
            Entrar
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/signup" className="font-medium text-terracotta">
            Crear cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}
