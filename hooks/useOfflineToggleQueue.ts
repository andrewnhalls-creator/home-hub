"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toggleShoppingItemComplete } from "@/app/(app)/compra/actions";

const QUEUE_KEY = "home-hub:offline-toggle-queue";

interface QueueEntry {
  itemId: string;
  isCompleted: boolean;
  /** Client-generated idempotency key — safe to replay after reconnect. */
  mutationId: string;
  /** Row version the user last SAW (kept from the first offline toggle so the
   * server can detect a divergent edit made by someone else meanwhile). */
  baseVersion: number;
}

function readQueue(): QueueEntry[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    const parsed = raw ? (JSON.parse(raw) as QueueEntry[]) : [];
    // Drop pre-B2.2 entries that lack idempotency metadata.
    return parsed.filter((e) => e.mutationId && typeof e.baseVersion === "number");
  } catch {
    return [];
  }
}

function writeQueue(queue: QueueEntry[]) {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // Storage unavailable — the visible state simply won't survive a reload.
  }
}

export function useOfflineToggleQueue(
  isOnline: boolean,
  onConflicts?: (count: number) => void,
) {
  const router = useRouter();

  const enqueue = useCallback((itemId: string, isCompleted: boolean, baseVersion: number) => {
    const queue = readQueue();
    const idx = queue.findIndex((e) => e.itemId === itemId);
    if (idx >= 0) {
      // Final intent wins; keep the baseVersion from when the user went
      // offline (that is the state they actually saw), new mutation id.
      queue[idx] = {
        ...queue[idx],
        isCompleted,
        mutationId: crypto.randomUUID(),
      };
    } else {
      queue.push({ itemId, isCompleted, mutationId: crypto.randomUUID(), baseVersion });
    }
    writeQueue(queue);
  }, []);

  useEffect(() => {
    if (!isOnline) return;
    const queue = readQueue();
    if (queue.length === 0) return;
    localStorage.removeItem(QUEUE_KEY);

    (async () => {
      let conflicts = 0;
      // Sequential replay preserves user intent order.
      for (const entry of queue) {
        try {
          const result = await toggleShoppingItemComplete(entry.itemId, entry.isCompleted, {
            mutationId: entry.mutationId,
            baseVersion: entry.baseVersion,
          });
          if (!result.ok) conflicts++;
        } catch {
          // Still offline / transient failure: requeue and stop.
          const remaining = queue.slice(queue.indexOf(entry));
          writeQueue([...remaining, ...readQueue()]);
          return;
        }
      }
      if (conflicts > 0) onConflicts?.(conflicts);
      router.refresh();
    })();
  }, [isOnline, router, onConflicts]);

  return { enqueue };
}
