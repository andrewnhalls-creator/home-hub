"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";

interface TopBarProps {
  householdName?: string;
}

export function TopBar({ householdName }: TopBarProps) {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => pathname?.startsWith(item.href));
  const title = current?.label ?? "Home Hub";

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-cream/95 px-4 py-4 backdrop-blur md:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-brown">{title}</h1>
        {householdName && (
          <span className="text-sm text-muted">{householdName}</span>
        )}
      </div>
    </header>
  );
}
