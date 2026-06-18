import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "accent";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  neutral: "bg-white/[0.08] text-muted border-white/[0.10]",
  success: "bg-success/[0.15] text-success border-success/[0.25]",
  warning: "bg-amber/[0.15] text-amber  border-amber/[0.25]",
  danger:  "bg-danger/[0.15] text-danger border-danger/[0.25]",
  accent:  "bg-terracotta/[0.15] text-terracotta border-terracotta/[0.25]",
};

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
