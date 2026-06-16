"use client";

import { useState, useEffect, useCallback } from "react";
import {
  upsertPushSubscription,
  removePushSubscription,
} from "@/app/(app)/ajustes/notificaciones/actions";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export type PushPermission = "default" | "granted" | "denied" | "unsupported";

interface PushState {
  isSupported: boolean;
  permission: PushPermission;
  isSubscribed: boolean;
  isLoading: boolean;
}

export interface UsePushSubscriptionResult extends PushState {
  subscribe: () => Promise<void>;
  unsubscribe: () => Promise<void>;
}

function initPushState(): PushState {
  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  return {
    isSupported,
    permission: isSupported ? (Notification.permission as PushPermission) : "unsupported",
    isSubscribed: false,
    isLoading: isSupported,
  };
}

export function usePushSubscription(): UsePushSubscriptionResult {
  const [state, setState] = useState<PushState>(initPushState);

  // Async-only effect: check existing subscription
  useEffect(() => {
    if (!state.isSupported) return;

    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((sub) => {
        setState((prev) => ({ ...prev, isSubscribed: sub !== null, isLoading: false }));
      })
      .catch(() => {
        setState((prev) => ({ ...prev, isLoading: false }));
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subscribe = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState((prev) => ({ ...prev, permission: permission as PushPermission, isLoading: false }));
        return;
      }

      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidKey) throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY not set");

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey).buffer as ArrayBuffer,
      });

      await upsertPushSubscription(
        subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } },
        navigator.userAgent,
      );
      setState((prev) => ({ ...prev, permission: "granted", isSubscribed: true, isLoading: false }));
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const unsubscribe = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await removePushSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setState((prev) => ({ ...prev, isSubscribed: false, isLoading: false }));
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  return { ...state, subscribe, unsubscribe };
}
