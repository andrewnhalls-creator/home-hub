"use client";

import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800"
    >
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      <span>Sin conexión — los cambios se sincronizarán al reconectarte</span>
    </div>
  );
}
