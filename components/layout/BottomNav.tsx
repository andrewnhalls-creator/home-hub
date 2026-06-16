"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { PRIMARY_NAV_ITEMS, MORE_NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";

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
                    "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium",
                    isActive ? "text-terracotta" : "text-muted",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              </li>
            );
          })}
          <li className="flex-1">
            <button
              type="button"
              onClick={() => setIsMoreOpen(true)}
              aria-haspopup="dialog"
              className={cn(
                "flex min-h-[56px] w-full flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium",
                isMoreActive ? "text-terracotta" : "text-muted",
              )}
            >
              <MoreHorizontal className="h-5 w-5" aria-hidden />
              <span className="whitespace-nowrap">Más</span>
            </button>
          </li>
        </ul>
      </nav>

      <Modal
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        title="Más opciones"
      >
        <ul className="grid grid-cols-3 gap-3">
          {MORE_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card px-2 py-4 text-center text-sm font-medium text-brown hover:bg-sand"
                >
                  <Icon className="h-6 w-6 text-terracotta" aria-hidden />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </Modal>
    </>
  );
}
