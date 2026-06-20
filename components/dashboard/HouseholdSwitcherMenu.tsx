"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { House, CaretUpDown, Check } from "@phosphor-icons/react";
import { switchHousehold, type HouseholdSwitchState } from "@/app/(app)/ajustes/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface Membership {
  household_id: string;
  role: "owner" | "member";
  households: { name: string } | null;
}

interface HouseholdSwitcherMenuProps {
  memberships: Membership[];
  activeHouseholdId: string;
}

const switchInitial: HouseholdSwitchState = {};

export function HouseholdSwitcherMenu({ memberships, activeHouseholdId }: HouseholdSwitcherMenuProps) {
  const [open, setOpen] = useState(false);
  const [switchState, switchAction] = useActionState(switchHousehold, switchInitial);
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (switchState.success) router.refresh();
  }, [switchState.success, router]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handle(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const activeName = memberships.find((m) => m.household_id === activeHouseholdId)?.households?.name ?? "";

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Cambiar de hogar"
        aria-expanded={open}
        aria-haspopup="listbox"
        className="flex items-center gap-1.5 rounded-xl border border-terracotta/30 bg-terracotta/10 px-2.5 py-1 text-sm font-medium text-terracotta transition hover:bg-terracotta/20 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
      >
        <House className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="max-w-[140px] truncate">{activeName}</span>
        <CaretUpDown className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Seleccionar hogar"
          className="absolute left-0 top-full z-50 mt-2 min-w-[200px] rounded-2xl border border-border bg-card/95 p-1.5 shadow-xl backdrop-blur-xl"
        >
          {memberships.map((m) => {
            const isActive = m.household_id === activeHouseholdId;
            const name = m.households?.name ?? "Hogar sin nombre";

            if (isActive) {
              return (
                <div
                  key={m.household_id}
                  role="option"
                  aria-selected="true"
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm"
                >
                  <span className="font-medium text-brown truncate">{name}</span>
                  <Check className="h-3.5 w-3.5 shrink-0 text-terracotta" aria-hidden />
                </div>
              );
            }

            return (
              <form key={m.household_id} action={switchAction}>
                <input type="hidden" name="householdId" value={m.household_id} />
                <button
                  type="submit"
                  role="option"
                  aria-selected="false"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm text-muted transition",
                    "hover:bg-sand hover:text-brown active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
                  )}
                >
                  <span className="truncate text-left">{name}</span>
                </button>
              </form>
            );
          })}
        </div>
      )}
    </div>
  );
}
