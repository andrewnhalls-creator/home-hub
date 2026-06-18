import Link from "next/link";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  label: string;
  metric: string | number;
  status?: string;
  statusColor?: string;
  attention?: boolean;
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
  attention = false,
  href,
  className,
}: MetricCardProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-[var(--radius-xl)] border bg-card p-4 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-card-hover)]",
        attention ? "border-terracotta/50 bg-terracotta/[0.08]" : "border-border",
        href && "cursor-pointer",
        className,
      )}
    >
      <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", attention ? "bg-terracotta/10" : iconBg)}>
        <Icon weight="light" size={20} className={cn(attention ? "text-terracotta" : iconColor)} aria-hidden />
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
      <Link href={href} className="block outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-cream rounded-[var(--radius-xl)] transition-transform active:scale-[0.98]">
        {content}
      </Link>
    );
  }

  return content;
}
