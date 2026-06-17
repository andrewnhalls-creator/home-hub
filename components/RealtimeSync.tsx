"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Tables that need cross-device sync. shopping_items is included so pages like
// the shopping list overview also stay fresh; ShoppingList.tsx additionally
// handles granular item-level updates via its own channel.
const WATCHED_TABLES = [
  "reminders",
  "chores",
  "calendar_events",
  "shopping_items",
  "shopping_lists",
  "wishlist_items",
  "household_documents",
  "expenses",
  "fixed_payments",
  "savings_goals",
  "subscriptions",
  "meal_plans",
  "recipes",
  "payment_instances",
];

interface RealtimeSyncProps {
  householdId: string;
}

export function RealtimeSync({ householdId }: RealtimeSyncProps) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();

    function scheduleRefresh() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => router.refresh(), 200);
    }

    const channel = supabase.channel(`household-sync:${householdId}`);

    for (const table of WATCHED_TABLES) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter: `household_id=eq.${householdId}` },
        scheduleRefresh,
      );
    }

    channel.subscribe();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      supabase.removeChannel(channel);
    };
  }, [householdId, router]);

  return null;
}
