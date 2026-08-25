"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import { QuickAddSheet } from "@/components/layout/QuickAddSheet";
import { cn } from "@/lib/utils";

export function AddNewButton({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={cn(
          "items-center gap-2 rounded-full bg-terracotta px-4 py-2.5 text-sm font-semibold text-cream shadow-[var(--shadow-btn)] transition hover:bg-coral active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
          className,
        )}
      >
        <Plus weight="bold" size={16} aria-hidden />
        Añadir nuevo
      </button>
      <QuickAddSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
