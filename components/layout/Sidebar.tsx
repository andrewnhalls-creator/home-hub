"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { GearSix, SignOut } from "@phosphor-icons/react";
import { PRIMARY_NAV_ITEMS, MENU_ITEMS } from "@/lib/constants";
import { signOut } from "@/app/auth/actions";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/lib/constants";

/** Module links shown under "Módulos" (Ajustes and its sub-pages live at the bottom). */
const MODULE_ITEMS = MENU_ITEMS.filter((item) => !item.href.startsWith("/ajustes"));

function SidebarLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
        isActive
          ? "bg-terracotta font-semibold text-cream"
          : "font-medium text-brown hover:bg-sand",
      )}
    >
      <Icon
        weight={isActive ? "fill" : "regular"}
        className={cn("h-5 w-5 shrink-0", isActive ? "text-cream" : "text-muted")}
        aria-hidden
      />
      {item.label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const isAjustes = pathname?.startsWith("/ajustes");

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card px-3 py-6 md:flex md:flex-col md:overflow-y-auto">
      <div className="mb-6 flex items-center gap-2.5 px-4">
        <Image
          src="/branding/home-hub-logo.png"
          alt="Logotipo de Home Hub"
          width={32}
          height={32}
          className="h-8 w-8 shrink-0"
        />
        <span className="font-display text-xl font-bold text-terracotta tracking-tight" translate="no">
          Home Hub
        </span>
      </div>

      <nav aria-label="Navegación principal" className="flex min-h-0 flex-1 flex-col">
        <div className="flex flex-col gap-0.5">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              isActive={!!pathname?.startsWith(item.href)}
            />
          ))}
        </div>

        <p className="mb-1 mt-6 px-4 text-[11px] font-semibold uppercase tracking-wider text-muted">
          Módulos
        </p>
        <div className="flex flex-col gap-0.5">
          {MODULE_ITEMS.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              isActive={!!pathname?.startsWith(item.href)}
            />
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-0.5 border-t border-border pt-4">
          <Link
            href="/ajustes"
            aria-current={isAjustes ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-full px-4 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta",
              isAjustes
                ? "bg-terracotta font-semibold text-cream"
                : "font-medium text-brown hover:bg-sand",
            )}
          >
            <GearSix
              weight={isAjustes ? "fill" : "regular"}
              className={cn("h-5 w-5 shrink-0", isAjustes ? "text-cream" : "text-muted")}
              aria-hidden
            />
            Ajustes
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium text-danger transition-colors hover:bg-danger-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
            >
              <SignOut className="h-5 w-5 shrink-0" aria-hidden />
              Cerrar sesión
            </button>
          </form>
        </div>
      </nav>
    </aside>
  );
}
