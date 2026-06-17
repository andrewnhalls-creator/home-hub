"use client";

import { useFormStatus } from "react-dom";
import { ShoppingCart } from "lucide-react";
import { generateShoppingListFromMealPlan } from "@/app/(app)/menu/actions";

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-sage bg-sage/10 px-4 py-3 text-sm font-medium text-sage transition-colors hover:bg-sage/20 disabled:opacity-50"
    >
      <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden />
      {pending ? "Generando lista…" : "Generar lista de la compra"}
    </button>
  );
}

interface Props {
  weekStartDate: string;
  weekEndDate: string;
  weekLabel: string;
}

export function GenerateListButton({ weekStartDate, weekEndDate, weekLabel }: Props) {
  return (
    <form action={generateShoppingListFromMealPlan}>
      <input type="hidden" name="weekStartDate" value={weekStartDate} />
      <input type="hidden" name="weekEndDate" value={weekEndDate} />
      <input type="hidden" name="weekLabel" value={weekLabel} />
      <SubmitBtn />
    </form>
  );
}
