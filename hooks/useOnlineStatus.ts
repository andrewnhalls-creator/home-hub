"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

export function useOnlineStatus(): boolean {
  // Server snapshot is `true` so SSR and the first client render always match;
  // the real value takes over immediately after hydration.
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}
