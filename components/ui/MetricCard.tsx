import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  label: string;
  metric: string | number;
  status?: string;
  statusColor?: string;
  href?: string;
  className?: string;
}

export function MetricCard({
  icon: Icon,
  iconColor = "text-terracotta",
  iconBg = "bg-terracotta/10",
  label,
  metric,
  status,
  statusColor = "text-muted",
  href,
  className,
}: MetricCardProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]",
        href && "cursor-pointer",
        className,
      )}
    >
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconBg)}>
        <Icon className={cn("h-5 w-5", iconColor)} aria-hidden />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-2xl font-bold text-brown leading-none tabular-nums">{metric}</span>
        <span className="text-sm font-medium text-brown">{label}</span>
        {status && (
          <span className={cn("text-xs leading-snug", statusColor)}>{status}</span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-2xl">
        {content}
      </Link>
    );
  }

  return content;
}
