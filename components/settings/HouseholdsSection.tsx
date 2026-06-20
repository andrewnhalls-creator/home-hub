"use client";

import { useActionState, useState } from "react";
import { Check, House, PlusCircle, ArrowsClockwise } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import {
  switchHousehold,
  createAdditionalHousehold,
  joinAdditionalHousehold,
  type HouseholdSwitchState,
  type CreateHouseholdState,
  type JoinHouseholdState,
} from "@/app/(app)/ajustes/actions";
import type { HouseholdRole } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface UserHousehold {
  household_id: string;
  role: HouseholdRole;
  households: { name: string } | null;
}

interface HouseholdsSectionProps {
  memberships: UserHousehold[];
  activeHouseholdId: string;
}

const switchInitial: HouseholdSwitchState = {};
const createInitial: CreateHouseholdState = {};
const joinInitial: JoinHouseholdState = {};

function AddHouseholdPanel({ onDone }: { onDone: () => void }) {
  const [mode, setMode] = useState<"create" | "join">("create");
  const [createState, createAction, isCreating] = useActionState(createAdditionalHousehold, createInitial);
  const [joinState, joinAction, isJoining] = useActionState(joinAdditionalHousehold, joinInitial);
  const router = useRouter();

  useEffect(() => {
    if (createState.success || joinState.success) {
      router.refresh();
      onDone();
    }
  }, [createState.success, joinState.success, router, onDone]);

  return (
    <div className="mt-4 rounded-2xl border border-border bg-card/50 p-4">
      <div className="flex rounded-xl border border-border bg-card p-1 mb-4">
        <button
          type="button"
          onClick={() => setMode("create")}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
            mode === "create" ? "bg-terracotta text-cream" : "text-muted"
          )}
        >
          Crear hogar
        </button>
        <button
          type="button"
          onClick={() => setMode("join")}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
            mode === "join" ? "bg-terracotta text-cream" : "text-muted"
          )}
        >
          Unirme a un hogar
        </button>
      </div>

      {mode === "create" ? (
        <form action={createAction} noValidate className="flex flex-col gap-3">
          <Input
            label="Nombre del hogar"
            name="name"
            placeholder="Nuestro piso"
            required
            error={createState.fieldErrors?.name}
          />
          {createState.error && <p className="text-sm text-danger">{createState.error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onDone}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" isLoading={isCreating}>
              Crear
            </Button>
          </div>
        </form>
      ) : (
        <form action={joinAction} noValidate className="flex flex-col gap-3">
          <Input
            label="Código de invitación"
            name="code"
            placeholder="Ej. AB12CD34"
            required
            error={joinState.fieldErrors?.code}
          />
          {joinState.error && <p className="text-sm text-danger">{joinState.error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onDone}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" isLoading={isJoining}>
              Unirme
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

export function HouseholdsSection({ memberships, activeHouseholdId }: HouseholdsSectionProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [switchState, switchAction] = useActionState(switchHousehold, switchInitial);
  const router = useRouter();

  useEffect(() => {
    if (switchState.success) router.refresh();
  }, [switchState.success, router]);

  const canAdd = memberships.length < 4;

  return (
    <div>
      <ul className="flex flex-col gap-2">
        {memberships.map((m) => {
          const isActive = m.household_id === activeHouseholdId;
          const name = m.households?.name ?? "Hogar sin nombre";

          return (
            <li
              key={m.household_id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition",
                isActive
                  ? "border-terracotta/50 bg-terracotta/10"
                  : "border-border bg-card/50"
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <House
                  className={cn("h-4 w-4 shrink-0", isActive ? "text-terracotta" : "text-muted")}
                  aria-hidden
                />
                <div className="min-w-0">
                  <p className={cn("text-sm font-medium truncate", isActive ? "text-brown" : "text-muted")}>
                    {name}
                  </p>
                  <p className="text-xs text-muted capitalize">
                    {m.role === "owner" ? "Propietario" : "Miembro"}
                  </p>
                </div>
              </div>

              {isActive ? (
                <Badge variant="accent">
                  <Check className="h-3 w-3 mr-1" aria-hidden />
                  Activo
                </Badge>
              ) : (
                <form action={switchAction}>
                  <input type="hidden" name="householdId" value={m.household_id} />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 rounded-xl border border-border px-3 py-1.5 text-xs font-medium text-muted transition hover:border-terracotta hover:text-terracotta active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                    aria-label={`Cambiar al hogar ${name}`}
                  >
                    <ArrowsClockwise className="h-3 w-3" aria-hidden />
                    Cambiar
                  </button>
                </form>
              )}
            </li>
          );
        })}
      </ul>

      {switchState.error && (
        <p className="mt-2 text-sm text-danger">{switchState.error}</p>
      )}

      {canAdd && !showAdd && (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-4 py-3 text-sm text-muted transition hover:border-terracotta hover:text-terracotta active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
        >
          <PlusCircle className="h-4 w-4" aria-hidden />
          Añadir otro hogar ({memberships.length}/4)
        </button>
      )}

      {!canAdd && (
        <p className="mt-3 text-center text-xs text-muted">
          Has alcanzado el límite de 4 hogares.
        </p>
      )}

      {showAdd && <AddHouseholdPanel onDone={() => setShowAdd(false)} />}
    </div>
  );
}
