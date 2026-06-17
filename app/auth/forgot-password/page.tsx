"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Introduce tu correo electrónico.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error: sbError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      });

      if (sbError) {
        setError("No se ha podido enviar el correo. Inténtalo de nuevo.");
      } else {
        setSent(true);
      }
    });
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-brown">Recuperar contraseña</h1>
        <p className="mt-1 text-sm text-muted">
          Te enviaremos un enlace para restablecer tu contraseña.
        </p>

        {sent ? (
          <div className="mt-6 rounded-xl bg-sage/10 p-4 text-sm text-brown">
            <p className="font-medium">Correo enviado</p>
            <p className="mt-1 text-muted">
              Revisa tu bandeja de entrada y haz clic en el enlace que te hemos enviado.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
            <Input
              label="Correo electrónico"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              error={error ?? undefined}
            />

            <Button type="submit" isLoading={isPending} className="mt-2">
              Enviar enlace
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/auth/login" className="font-medium text-terracotta">
            Volver a entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
