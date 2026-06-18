import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "featured" | "subtle" | "metric";

const outerClasses: Partial<Record<CardVariant, string>> = {
  default:  "p-[3px] bg-border/50 rounded-[calc(var(--radius-lg)+3px)] shadow-[var(--shadow-card)]",
  featured: "p-[3px] bg-terracotta/20 rounded-[calc(var(--radius-lg)+3px)] shadow-[var(--shadow-card)]",
};

const innerClasses: Record<CardVariant, string> = {
  default:  "bg-card rounded-[var(--radius-lg)] p-4",
  featured: "bg-card rounded-[var(--radius-lg)] p-4",
  subtle:   "bg-sand border border-border rounded-2xl p-4",
  metric:   "bg-card border border-border rounded-2xl p-4 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-200",
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

export function Card({ className, variant = "default", children, ...rest }: CardProps) {
  const outer = outerClasses[variant];
  if (outer) {
    return (
      <div className={outer}>
        <div className={cn(innerClasses[variant], className)} {...rest}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className={cn(innerClasses[variant], className)} {...rest}>
      {children}
    </div>
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
