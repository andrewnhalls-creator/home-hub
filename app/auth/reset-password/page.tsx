"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    startTransition(async () => {
      const supabase = createClient();
      const { error: sbError } = await supabase.auth.updateUser({ password });

      if (sbError) {
        setError("No se ha podido actualizar la contraseña. El enlace puede haber caducado.");
      } else {
        router.push("/dashboard");
      }
    });
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-brown">Nueva contraseña</h1>
        <p className="mt-1 text-sm text-muted">Elige una contraseña segura para tu cuenta.</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          <Input
            label="Nueva contraseña"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
          />
          <Input
            label="Repetir contraseña"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => { setConfirm(e.target.value); setError(null); }}
          />

          {error && <p className="text-sm text-danger">{error}</p>}

          <Button type="submit" isLoading={isPending} className="mt-2">
            Guardar contraseña
          </Button>
        </form>
      </div>
    </main>
  );
}
