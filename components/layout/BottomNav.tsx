"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { PRIMARY_NAV_ITEMS, MORE_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { MoreMenuSheet } from "@/components/layout/MoreMenuSheet";

export function BottomNav() {
  const pathname = usePathname();
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const isMoreActive = MORE_NAV_ITEMS.some((item) =>
    pathname?.startsWith(item.href),
  );

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="flex">
          {PRIMARY_NAV_ITEMS.map((item) => {
            const isActive = pathname?.startsWith(item.href);
            const Icon = item.icon;
            return (
              <li key={item.href} className="flex-1">
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors",
                    isActive ? "text-terracotta" : "text-muted",
                  )}
                >
                  <Icon
                    className={cn("h-5 w-5 transition-transform", isActive && "scale-110")}
                    aria-hidden
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              </li>
            );
          })}

          {/* Más button */}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isMoreOpen}
              className={cn(
                "flex min-h-[56px] w-full flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium transition-colors",
                isMoreActive ? "text-terracotta" : "text-muted",
              )}
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden />
              <span className="whitespace-nowrap">Más</span>
            </button>
          </li>
        </ul>
      </nav>

      <MoreMenuSheet isOpen={isMoreOpen} onClose={() => setIsMoreOpen(false)} />
    </>
  );
}
