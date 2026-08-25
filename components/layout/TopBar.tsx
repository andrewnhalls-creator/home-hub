"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MagnifyingGlass, CaretDown, List } from "@phosphor-icons/react";
import { NAV_ITEMS } from "@/lib/constants";
import { NotificationCentre } from "@/components/notifications/NotificationCentre";
import { AppDrawer } from "@/components/layout/AppDrawer";
import { cn } from "@/lib/utils";
import type { NotificationEvent } from "@/lib/types";

interface TopBarProps {
  householdName?: string;
  userName?: string;
  userRole?: "owner" | "member";
  notifications?: NotificationEvent[];
  unreadCount?: number;
}

export function TopBar({ householdName, userName, userRole, notifications = [], unreadCount = 0 }: TopBarProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const current = NAV_ITEMS.find((item) => pathname?.startsWith(item.href));
  const pageTitle = current?.label ?? "";
  const isHome = pathname?.startsWith("/dashboard");

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:px-6">
      <div className="flex items-center gap-2">
        {/* Mobile: household pill on Inicio, page title elsewhere */}
        {isHome || !pageTitle ? (
          householdName ? (
            <Link
              href="/ajustes"
              className="flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-full py-1 pr-2 text-sm font-semibold text-brown transition hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta md:hidden"
              aria-label={`Casa actual: ${householdName}. Gestionar en Ajustes`}
            >
              <span className="max-w-[160px] truncate">{householdName}</span>
              <CaretDown weight="bold" size={12} className="text-muted" aria-hidden />
            </Link>
          ) : (
            <span className="font-display text-base font-bold text-terracotta tracking-tight md:hidden" translate="no">
              Home Hub
            </span>
          )
        ) : null}

        {!isHome && pageTitle && (
          <span className="flex-1 text-center text-sm font-semibold text-brown md:hidden">
            {pageTitle}
          </span>
        )}
        {(isHome || !pageTitle) && <div className="flex-1 md:hidden" />}

        {/* Desktop: household name (sidebar shows full nav) */}
        {householdName && (
          <span className="hidden text-sm text-muted md:block md:flex-1">{householdName}</span>
        )}
        {!householdName && <div className="hidden md:block md:flex-1" />}

        {/* Right: search + notifications + menu */}
        <div className="flex shrink-0 items-center gap-1">
          <Link
            href="/buscar"
            aria-label="Buscar"
            className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
          >
            <MagnifyingGlass weight="light" size={22} aria-hidden />
          </Link>
          <NotificationCentre notifications={notifications} unreadCount={unreadCount} />
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Abrir menú"
            aria-haspopup="dialog"
            aria-expanded={isDrawerOpen}
            className={cn(
              "flex h-11 w-11 items-center justify-center rounded-full transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta md:hidden",
              isDrawerOpen ? "text-terracotta" : "text-muted",
            )}
          >
            {userName ? (
              <span
                className="flex h-8 w-8 items-center justify-center rounded-full bg-terracotta/10 text-sm font-bold text-terracotta"
                aria-hidden
              >
                {userName.trim().charAt(0).toUpperCase()}
              </span>
            ) : (
              <List weight="light" size={22} aria-hidden />
            )}
          </button>
        </div>
      </div>

      <AppDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        householdName={householdName}
        userName={userName}
        userRole={userRole}
      />
    </header>
  );
}
