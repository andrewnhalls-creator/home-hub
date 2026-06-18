import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "featured" | "subtle" | "metric";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantBase =
  "relative overflow-hidden rounded-[var(--radius-xl)] border bg-white/[0.07] p-4";

const variantClasses: Record<CardVariant, string> = {
  default:  "border-white/[0.12] shadow-[var(--shadow-card)]",
  featured: "border-terracotta/40 shadow-[0_0_0_1px_var(--color-terracotta),var(--shadow-card)]",
  subtle:   "border-white/[0.06] bg-white/[0.04]",
  metric:
    "border-white/[0.12] shadow-[var(--shadow-card)] transition-[background,box-shadow] duration-200 hover:bg-white/[0.12] hover:shadow-[var(--shadow-card-hover)]",
};

export function Card({ className, variant = "default", children, style, ...rest }: CardProps) {
  return (
    <div
      className={cn(variantBase, variantClasses[variant], className)}
      style={{ backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", ...style }}
      {...rest}
    >
      {/* Top edge light refraction */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)" }}
      />
      {/* Left edge light refraction */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-px"
        style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.15), transparent, rgba(255,255,255,0.05))" }}
      />
      {children}
    </div>
  );
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-brown sm:text-lg", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}
