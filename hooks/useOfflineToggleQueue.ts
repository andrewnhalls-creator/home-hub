"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toggleShoppingItemComplete } from "@/app/(app)/compra/actions";

const QUEUE_KEY = "home-hub:offline-toggle-queue";

interface QueueEntry {
  itemId: string;
  isCompleted: boolean;
}

function readQueue(): QueueEntry[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as QueueEntry[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueueEntry[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export function useOfflineToggleQueue(isOnline: boolean) {
  const router = useRouter();

  const enqueue = useCallback((itemId: string, isCompleted: boolean) => {
    const queue = readQueue();
    const idx = queue.findIndex((e) => e.itemId === itemId);
    if (idx >= 0) {
      queue[idx] = { itemId, isCompleted };
    } else {
      queue.push({ itemId, isCompleted });
    }
    writeQueue(queue);
  }, []);

  useEffect(() => {
    if (!isOnline) return;
    const queue = readQueue();
    if (queue.length === 0) return;
    localStorage.removeItem(QUEUE_KEY);
    Promise.all(queue.map((e) => toggleShoppingItemComplete(e.itemId, e.isCompleted))).then(() => {
      router.refresh();
    });
  }, [isOnline, router]);

  return { enqueue };
}
