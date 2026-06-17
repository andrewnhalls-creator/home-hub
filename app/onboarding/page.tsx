"use client";

import { useActionState, useState } from "react";
import { createHousehold, joinHousehold, type OnboardingActionState } from "./actions";
import { signOut } from "@/app/auth/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const initialState: OnboardingActionState = {};

export default function OnboardingPage() {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [createState, createAction, isCreating] = useActionState(createHousehold, initialState);
  const [joinState, joinAction, isJoining] = useActionState(joinHousehold, initialState);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-brown">Bienvenido a Home Hub</h1>
        <p className="mt-1 text-sm text-muted">
          Crea un hogar nuevo o únete a uno con un código de invitación.
        </p>

        <div className="mt-6 flex rounded-xl border border-border bg-card p-1">
          <button
            type="button"
            onClick={() => setMode("create")}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium",
              mode === "create" ? "bg-terracotta text-cream" : "text-muted",
            )}
          >
            Crear hogar
          </button>
          <button
            type="button"
            onClick={() => setMode("join")}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-medium",
              mode === "join" ? "bg-terracotta text-cream" : "text-muted",
            )}
          >
            Unirme a un hogar
          </button>
        </div>

        {mode === "create" ? (
          <form action={createAction} noValidate className="mt-6 flex flex-col gap-4">
            <Input
              label="Nombre del hogar"
              name="name"
              placeholder="Nuestra casa"
              required
              error={createState.fieldErrors?.name}
            />
            {createState.error && (
              <p className="text-sm text-danger">{createState.error}</p>
            )}
            <Button type="submit" isLoading={isCreating}>
              Crear mi hogar
            </Button>
          </form>
        ) : (
          <form action={joinAction} noValidate className="mt-6 flex flex-col gap-4">
            <Input
              label="Código de invitación"
              name="code"
              placeholder="Ej. AB12CD34"
              required
              error={joinState.fieldErrors?.code}
            />
            {joinState.error && (
              <p className="text-sm text-danger">{joinState.error}</p>
            )}
            <Button type="submit" isLoading={isJoining}>
              Unirme a mi pareja
            </Button>
          </form>
        )}

        <form action={signOut} className="mt-6 text-center">
          <button type="submit" className="text-sm text-muted underline">
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}
