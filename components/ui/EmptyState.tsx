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
    <div className={cn(
      "flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center",
      className
    )}>
      {Icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sand text-terracotta">
          <Icon className="h-7 w-7" aria-hidden />
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <p className="text-base font-semibold text-brown">{title}</p>
        {description && <p className="max-w-xs text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
