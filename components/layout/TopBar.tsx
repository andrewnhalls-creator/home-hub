"use client";

import { usePathname } from "next/navigation";
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
  const title = current?.label ?? "Home Hub";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-cream/95 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold text-brown md:hidden">{title}</h1>
        <div className="flex flex-1 items-center justify-end gap-3">
          {householdName && (
            <span className="hidden text-sm text-muted md:inline">{householdName}</span>
          )}
          <NotificationCentre notifications={notifications} unreadCount={unreadCount} />
        </div>
      </div>
    </header>
  );
}
