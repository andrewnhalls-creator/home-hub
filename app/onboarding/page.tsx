"use client";

import { useActionState, useState } from "react";
import { HandWaving, HouseLine, UsersThree, ArrowLeft, Check } from "@phosphor-icons/react";
import { createHousehold, joinHousehold, type OnboardingActionState } from "./actions";
import { signOut } from "@/app/auth/actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const initialState: OnboardingActionState = {};

type Mode = "create" | "join";

const OPTIONS: { value: Mode; title: string; description: string; icon: typeof HouseLine }[] = [
  {
    value: "create",
    title: "Crear una nueva casa",
    description: "Configura tu hogar desde cero e invita a otros más tarde.",
    icon: HouseLine,
  },
  {
    value: "join",
    title: "Unirse a una casa existente",
    description: "Introduce el código de invitación que te han compartido.",
    icon: UsersThree,
  },
];

export default function OnboardingPage() {
  const [mode, setMode] = useState<Mode | null>(null);
  const [step, setStep] = useState<"choose" | "form">("choose");
  const [createState, createAction, isCreating] = useActionState(createHousehold, initialState);
  const [joinState, joinAction, isJoining] = useActionState(joinHousehold, initialState);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {step === "choose" ? (
          <>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sage/10 text-sage" aria-hidden>
                <HandWaving weight="regular" size={26} />
              </div>
              <h1 className="mt-4 text-3xl font-bold leading-tight text-brown">
                ¿Cómo quieres empezar?
              </h1>
              <p className="mt-2 text-sm text-muted">
                Configura tu espacio para empezar a organizar tu hogar.
              </p>
            </div>

            <div role="radiogroup" aria-label="Cómo quieres empezar" className="mt-7 flex flex-col gap-3">
              {OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = mode === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => setMode(option.value)}
                    className={cn(
                      "flex items-start gap-3.5 rounded-[var(--radius-xl)] border bg-card p-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
                      isSelected
                        ? "border-terracotta shadow-[var(--shadow-card)]"
                        : "border-border hover:bg-sand",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
                        isSelected ? "bg-terracotta text-cream" : "bg-sand text-brown",
                      )}
                      aria-hidden
                    >
                      {isSelected ? <Check weight="bold" size={20} /> : <Icon weight="regular" size={22} />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brown">{option.title}</p>
                      <p className="mt-0.5 text-sm text-muted">{option.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <Button
              type="button"
              disabled={!mode}
              onClick={() => mode && setStep("form")}
              className="mt-7 w-full"
            >
              Continuar
            </Button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setStep("choose")}
              className="mb-5 flex min-h-[44px] items-center gap-1.5 rounded-full pr-3 text-sm font-medium text-muted transition hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
            >
              <ArrowLeft weight="bold" size={16} aria-hidden />
              Volver
            </button>

            {mode === "create" ? (
              <>
                <h1 className="text-2xl font-bold text-brown">Crea tu casa</h1>
                <p className="mt-1.5 text-sm text-muted">
                  Ponle un nombre que reconozcáis todos en casa.
                </p>
                <form action={createAction} noValidate className="mt-6 flex flex-col gap-4">
                  <Input
                    label="Nombre del hogar"
                    name="name"
                    placeholder="Piso en Madrid"
                    required
                    error={createState.fieldErrors?.name}
                  />
                  {createState.error && <p className="text-sm text-danger">{createState.error}</p>}
                  <Button type="submit" isLoading={isCreating}>
                    Crear mi casa
                  </Button>
                </form>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-brown">Únete a una casa</h1>
                <p className="mt-1.5 text-sm text-muted">
                  Introduce el código de invitación que te han compartido.
                </p>
                <form action={joinAction} noValidate className="mt-6 flex flex-col gap-4">
                  <Input
                    label="Código de invitación"
                    name="code"
                    placeholder="Ej. AB12CD34"
                    required
                    error={joinState.fieldErrors?.code}
                  />
                  {joinState.error && <p className="text-sm text-danger">{joinState.error}</p>}
                  <Button type="submit" isLoading={isJoining}>
                    Unirme a la casa
                  </Button>
                </form>
              </>
            )}
          </>
        )}

        <form action={signOut} className="mt-8 text-center">
          <button
            type="submit"
            className="min-h-[44px] rounded-full px-3 text-sm text-muted underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </main>
  );
}
