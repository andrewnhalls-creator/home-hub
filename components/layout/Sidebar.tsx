"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const SEPARATOR_BEFORE = ["/ajustes"];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden w-60 shrink-0 border-r border-white/[0.10] px-3 py-6 md:flex md:flex-col md:gap-1 md:overflow-y-auto"
      style={{ background: "rgba(13,11,31,0.75)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
    >
      <div className="mb-5 px-3">
        <span className="font-display text-xl font-bold text-terracotta tracking-tight">Home Hub</span>
      </div>
      <nav aria-label="Navegación principal" className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <div key={item.href}>
              {SEPARATOR_BEFORE.includes(item.href) && (
                <div className="my-2 border-t border-white/[0.10]" role="separator" />
              )}
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-terracotta/[0.15] text-terracotta"
                    : "text-brown hover:bg-white/[0.08] hover:text-brown",
                )}
              >
                <Icon
                  className={cn("h-5 w-5 shrink-0", isActive ? "text-terracotta" : "text-muted")}
                  aria-hidden
                />
                {item.label}
              </Link>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
