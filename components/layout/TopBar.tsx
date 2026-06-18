"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { NAV_ITEMS } from "@/lib/constants";
import { NotificationCentre } from "@/components/notifications/NotificationCentre";
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
    <header className="sticky top-0 z-30 border-b border-border bg-card px-4 py-3 md:px-6">
        <div className="flex items-center gap-2">
          {/* Left: Home Hub brand link — mobile only */}
          <Link
            href="/dashboard"
            className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta md:hidden"
            aria-label="Inicio"
          >
            <span className="text-base font-bold text-terracotta" translate="no">Home Hub</span>
          </Link>

          {/* Center: current page title (hidden on Home and desktop) */}
          {!isHome && pageTitle && (
            <span className="flex-1 truncate text-center text-sm font-semibold text-brown md:hidden">
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
              <Search className="h-5 w-5" aria-hidden />
            </Link>
            <NotificationCentre notifications={notifications} unreadCount={unreadCount} />
          </div>
        </div>
    </header>
  );
}
