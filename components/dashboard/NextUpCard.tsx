import Link from "next/link";
import type { Icon } from "@phosphor-icons/react";

interface NextUpCardProps {
  label: string;
  title: string;
  href: string;
  icon: Icon;
  iconColor: string;
  iconBg: string;
  /** Big right-aligned value, e.g. "20:30" or "1.200 €". */
  primary: string;
  /** Small line under the value, e.g. "Hoy" or "Día 1". */
  secondary?: string;
}

export function NextUpCard({ label, title, href, icon: IconComponent, iconColor, iconBg, primary, secondary }: NextUpCardProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3.5 rounded-[var(--radius-xl)] border border-border bg-card p-4 shadow-[var(--shadow-card)] transition hover:bg-sand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
    >
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconBg}`} aria-hidden>
        <IconComponent weight="regular" size={22} className={iconColor} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{label}</p>
        <p className="truncate text-sm font-semibold text-brown">{title}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-lg font-bold tabular-nums text-brown">{primary}</p>
        {secondary && <p className="text-xs text-muted">{secondary}</p>}
      </div>
    </Link>
  );
}
