"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SegmentedToggleProps {
  className?: string;
}

export function SegmentedToggle({ className }: SegmentedToggleProps) {
  const pathname = usePathname();
  const isLista = pathname.startsWith("/compra");
  const isSemana = pathname.startsWith("/menu");

  return (
    <div
      role="tablist"
      aria-label="Cambiar vista"
      className={cn(
        "flex gap-1 rounded-xl border border-white/10 p-1",
        className,
      )}
    >
      <Link
        href="/compra"
        role="tab"
        aria-selected={isLista}
        className={cn(
          "flex flex-1 items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
          isLista
            ? "bg-terracotta/20 text-terracotta"
            : "text-muted hover:text-cream",
        )}
      >
        Lista
      </Link>
      <Link
        href="/menu"
        role="tab"
        aria-selected={isSemana}
        className={cn(
          "flex flex-1 items-center justify-center rounded-lg py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage",
          isSemana
            ? "bg-sage/20 text-sage"
            : "text-muted hover:text-cream",
        )}
      >
        Semana
      </Link>
    </div>
  );
}
