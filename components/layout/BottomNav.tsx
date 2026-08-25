"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import { PRIMARY_NAV_ITEMS } from "@/lib/constants";
import { QuickAddSheet } from "@/components/layout/QuickAddSheet";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/constants";

function NavTab({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <li className="flex-1">
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[12px] transition active:scale-[0.9]",
          isActive ? "font-semibold text-terracotta" : "font-medium text-muted",
        )}
      >
        <Icon
          weight={isActive ? "fill" : "regular"}
          size={22}
          className={cn("transition-transform", isActive && "scale-110")}
          aria-hidden
        />
        <span className="whitespace-nowrap">{item.label}</span>
      </Link>
    </li>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [first, second, third, fourth] = PRIMARY_NAV_ITEMS;

  return (
    <>
      <nav
        aria-label="Navegación principal"
        className="fixed inset-x-0 bottom-0 z-40 rounded-t-xl bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_rgba(0,0,0,0.04)] md:hidden"
      >
        <ul className="flex items-center">
          <NavTab item={first} isActive={!!pathname?.startsWith(first.href)} />
          <NavTab item={second} isActive={!!pathname?.startsWith(second.href)} />

          {/* Center FAB — quick add */}
          <li className="flex w-16 shrink-0 justify-center">
            <button
              type="button"
              onClick={() => setIsAddOpen(true)}
              aria-label="Añadir"
              aria-haspopup="dialog"
              aria-expanded={isAddOpen}
              className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-terracotta text-cream shadow-[0_8px_24px_rgba(21,66,18,0.35)] transition hover:bg-coral active:scale-[0.94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
            >
              <Plus weight="bold" size={26} aria-hidden />
            </button>
          </li>

          <NavTab item={third} isActive={!!pathname?.startsWith(third.href)} />
          <NavTab item={fourth} isActive={!!pathname?.startsWith(fourth.href)} />
        </ul>
      </nav>

      <QuickAddSheet isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
    </>
  );
}
