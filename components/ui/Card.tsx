import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "featured" | "subtle" | "metric";

const variantClasses: Record<CardVariant, string> = {
  default: "bg-card backdrop-blur-xl border border-border shadow-[var(--shadow-card)]",
  featured: "bg-card backdrop-blur-xl border-2 border-terracotta/30 shadow-[var(--shadow-card)]",
  subtle: "bg-white/5 backdrop-blur-sm border border-white/8",
  metric: "bg-card backdrop-blur-xl border border-border shadow-[var(--shadow-card)] hover:bg-white/12 hover:shadow-[var(--shadow-card-hover)] transition-[box-shadow,background-color] duration-200",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-2xl p-4", variantClasses[variant], className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-semibold text-brown", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted", className)} {...props} />;
}
