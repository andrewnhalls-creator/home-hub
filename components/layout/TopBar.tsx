"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { NAV_ITEMS } from "@/lib/constants";
import { NotificationCentre } from "@/components/notifications/NotificationCentre";
import { cn } from "@/lib/utils";
import type { NotificationEvent } from "@/lib/types";

interface TopBarProps {
  householdName?: string;
  notifications?: NotificationEvent[];
  unreadCount?: number;
}

export function TopBar({ householdName, notifications = [], unreadCount = 0 }: TopBarProps) {
  const pathname = usePathname();

  const current = NAV_ITEMS.find((item) => pathname?.startsWith(item.href));
  const pageTitle = current?.label ?? "";
  const isHome = pathname?.startsWith("/dashboard");

  return (
    <header
      className="sticky top-0 z-30 border-b border-white/[0.10] px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] md:px-6"
      style={{ background: "rgba(13,11,31,0.80)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
    >
        <div className="flex items-center gap-2">
          {/* Left: Home Hub brand link — mobile only, shown on home page and as fallback */}
          <Link
            href="/dashboard"
            className={cn(
              "shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta md:hidden",
              !isHome && pageTitle ? "hidden" : "",
            )}
            aria-label="Inicio"
          >
            <span className="font-display text-base font-bold text-terracotta tracking-tight" translate="no">Home Hub</span>
          </Link>

          {/* Center: current page title (hidden on Home and desktop) */}
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

          {/* Right: search + notifications */}
          <div className="flex shrink-0 items-center gap-1">
            <Link
              href="/buscar"
              aria-label="Buscar"
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition hover:bg-sand active:scale-[0.9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta"
            >
              <MagnifyingGlass weight="light" size={22} aria-hidden />
            </Link>
            <NotificationCentre notifications={notifications} unreadCount={unreadCount} />
          </div>
        </div>
    </header>
  );
}
