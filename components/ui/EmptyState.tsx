import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center gap-4 overflow-hidden rounded-[var(--radius-xl)] border border-dashed border-white/[0.15] bg-white/[0.04] px-6 py-12 text-center",
        className,
      )}
      style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
    >
      {/* Subtle top edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.10), transparent)" }}
      />
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-terracotta/[0.12] text-terracotta ring-1 ring-terracotta/20">
          <Icon className="h-7 w-7" aria-hidden />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-brown">{title}</p>
        {description && (
          <p className="max-w-xs text-sm leading-relaxed text-muted">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
