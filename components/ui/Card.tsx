import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "featured" | "subtle" | "metric";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantBase =
  "relative overflow-hidden rounded-[var(--radius-xl)] border bg-card p-4";

const variantClasses: Record<CardVariant, string> = {
  default:  "border-border shadow-[var(--shadow-card)]",
  featured: "border-terracotta/40 shadow-[0_0_0_1px_var(--color-terracotta),var(--shadow-card)]",
  subtle:   "border-border/70 bg-sand/60",
  metric:
    "border-border shadow-[var(--shadow-card)] transition-[background,box-shadow] duration-200 hover:bg-sand hover:shadow-[var(--shadow-card-hover)]",
};

export function Card({ className, variant = "default", children, ...rest }: CardProps) {
  return (
    <div
      className={cn(variantBase, variantClasses[variant], className)}
      {...rest}
    >
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
