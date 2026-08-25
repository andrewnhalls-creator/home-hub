"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { House, EnvelopeSimple, LockSimple, Eye, EyeSlash, ArrowRight } from "@phosphor-icons/react";
import { signIn, type AuthActionState } from "@/app/auth/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const initialState: AuthActionState = {};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, initialState);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-[var(--radius-xl)] bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-terracotta text-cream" aria-hidden>
            <House weight="regular" size={26} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-brown">Bienvenido a casa</h1>
          <p className="mt-1.5 text-sm text-muted">
            Introduce tus datos para acceder a tu hogar digital.
          </p>
        </div>

        <form action={formAction} noValidate className="mt-7 flex flex-col gap-4">
          <Input
            label="Correo electrónico"
            name="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            icon={EnvelopeSimple}
            required
            error={state.fieldErrors?.email}
          />
          <Input
            label="Contraseña"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            icon={LockSimple}
            required
            error={state.fieldErrors?.password}
            labelEnd={
              <Link
                href="/auth/forgot-password"
                className="text-xs font-medium text-amber hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber rounded"
              >
                ¿Has olvidado la contraseña?
              </Link>
            }
            endSlot={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-sand hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
              >
                {showPassword ? <EyeSlash size={18} aria-hidden /> : <Eye size={18} aria-hidden />}
              </button>
            }
          />

          {state.error && <p className="text-sm text-danger">{state.error}</p>}

          <Button type="submit" isLoading={isPending} className="mt-2">
            Entrar
            <ArrowRight weight="bold" size={16} aria-hidden />
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-3" aria-hidden>
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted">o</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <p className="mt-5 text-center text-sm text-muted">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/signup" className="font-medium text-terracotta hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </main>
  );
}
