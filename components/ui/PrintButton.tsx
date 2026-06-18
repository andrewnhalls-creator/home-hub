"use client";

import { Printer } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrintButtonProps {
  label?: string;
  className?: string;
}

export function PrintButton({ label = "Exportar PDF", className }: PrintButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={cn(
        "no-print flex items-center gap-2 rounded-[var(--radius-xl)] border border-white/[0.12] bg-white/[0.06] px-4 py-2.5 text-sm font-medium text-muted transition hover:bg-white/[0.10] hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta active:scale-[0.97]",
        className,
      )}
    >
      <Printer className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </button>
  );
}
