"use client";

import { useState, useTransition } from "react";
import { BellOff, Loader2, Send, AlertTriangle } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { NOTIFICATION_CATEGORY_META } from "@/lib/notificationCategories";
import { upsertNotificationPreferences, sendTestNotification } from "@/app/(app)/ajustes/notificaciones/actions";
import type { NotificationCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

interface NotificationPreferences {
  push_enabled: boolean;
  categories: Record<NotificationCategory, boolean>;
  lead_time_minutes: number;
}

const DEFAULT_CATEGORIES: Record<NotificationCategory, boolean> = {
  recordatorios: true,
  calendario: true,
  tareas: true,
  pagos: true,
  suscripciones: true,
  documentos: true,
  menu: true,
  compra: true,
  actividad_hogar: true,
  resumen_diario: true,
  resumen_semanal: true,
};

interface NotificationsSettingsProps {
  initialPrefs: NotificationPreferences | null;
}

export function NotificationsSettings({ initialPrefs }: NotificationsSettingsProps) {
  const { isSupported, permission, isSubscribed, isLoading: swLoading, subscribe, unsubscribe } =
    usePushSubscription();

  const [prefs, setPrefs] = useState<NotificationPreferences>({
    push_enabled: initialPrefs?.push_enabled ?? true,
    categories: { ...DEFAULT_CATEGORIES, ...(initialPrefs?.categories ?? {}) },
    lead_time_minutes: initialPrefs?.lead_time_minutes ?? 30,
  });

  const [isPending, startTransition] = useTransition();
  const [testSent, setTestSent] = useState(false);

  function toggleCategory(category: NotificationCategory) {
    const next = { ...prefs, categories: { ...prefs.categories, [category]: !prefs.categories[category] } };
    setPrefs(next);
    startTransition(async () => {
      await upsertNotificationPreferences({
        pushEnabled: next.push_enabled,
        categories: next.categories,
        leadTimeMinutes: next.lead_time_minutes,
      });
    });
  }

  function handleTogglePush() {
    const next = { ...prefs, push_enabled: !prefs.push_enabled };
    setPrefs(next);
    startTransition(async () => {
      await upsertNotificationPreferences({
        pushEnabled: next.push_enabled,
        categories: next.categories,
        leadTimeMinutes: next.lead_time_minutes,
      });
    });
  }

  function handleSubscribe() {
    startTransition(async () => {
      await subscribe();
    });
  }

  function handleUnsubscribe() {
    startTransition(async () => {
      await unsubscribe();
    });
  }

  function handleTestNotification() {
    startTransition(async () => {
      await sendTestNotification();
      setTestSent(true);
    });
  }

  const isWorking = swLoading || isPending;

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardTitle>Notificaciones push</CardTitle>
        <CardDescription>Recibe avisos en tu dispositivo aunque no tengas la app abierta.</CardDescription>

        <div className="mt-4 flex flex-col gap-3">
          {!isSupported && (
            <div className="flex items-start gap-2 rounded-xl bg-sand p-3 text-sm text-muted">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" aria-hidden />
              <span>
                Tu dispositivo o navegador no admite notificaciones push. En iOS, instala la app en la pantalla
                de inicio (iOS 16.4+) y vuelve a intentarlo.
              </span>
            </div>
          )}

          {isSupported && permission === "denied" && (
            <div className="flex items-start gap-2 rounded-xl bg-sand p-3 text-sm text-muted">
              <BellOff className="mt-0.5 h-4 w-4 shrink-0 text-danger" aria-hidden />
              <span>
                Las notificaciones están bloqueadas. Ve a los ajustes de tu navegador y permite las
                notificaciones para este sitio.
              </span>
            </div>
          )}

          {isSupported && permission !== "denied" && (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-brown">
                  {isSubscribed ? "Activas en este dispositivo" : "No activadas en este dispositivo"}
                </p>
                <p className="text-xs text-muted">
                  {isSubscribed
                    ? "Recibirás notificaciones push aquí."
                    : "Activa para recibir avisos en segundo plano."}
                </p>
              </div>
              {isSubscribed ? (
                <Button
                  variant="secondary"
                  onClick={handleUnsubscribe}
                  disabled={isWorking}
                  isLoading={isWorking}
                  className="shrink-0"
                >
                  Desactivar
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleSubscribe}
                  disabled={isWorking}
                  isLoading={isWorking}
                  className="shrink-0"
                >
                  Activar
                </Button>
              )}
            </div>
          )}

          {isSubscribed && (
            <button
              type="button"
              onClick={handleTestNotification}
              disabled={isWorking || testSent}
              className="flex items-center gap-2 self-start text-sm font-medium text-terracotta disabled:opacity-50"
            >
              <Send className="h-4 w-4" aria-hidden />
              {testSent ? "Prueba enviada — revisa tu centro de notificaciones" : "Probar notificación"}
            </button>
          )}
        </div>
      </Card>

      <Card>
        <CardTitle>Categorías</CardTitle>
        <CardDescription>Elige qué tipos de avisos quieres recibir.</CardDescription>

        <div className="mt-3 flex items-center justify-between gap-3 border-b border-sand pb-3">
          <span className="text-sm font-medium text-brown">Activar notificaciones push</span>
          <button
            type="button"
            role="switch"
            aria-checked={prefs.push_enabled}
            aria-label="Activar notificaciones push"
            onClick={handleTogglePush}
            disabled={isWorking}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              prefs.push_enabled ? "bg-terracotta" : "bg-sand",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block h-5 w-5 rounded-full bg-cream shadow-sm transition-transform",
                prefs.push_enabled ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>

        <ul className="mt-3 flex flex-col divide-y divide-sand">
          {(Object.keys(NOTIFICATION_CATEGORY_META) as NotificationCategory[]).map((category) => {
            const { label, icon: Icon } = NOTIFICATION_CATEGORY_META[category];
            const enabled = prefs.categories[category] ?? true;
            return (
              <li key={category} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sand text-terracotta">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="text-sm text-brown">{label}</span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`${label}: ${enabled ? "activado" : "desactivado"}`}
                  onClick={() => toggleCategory(category)}
                  disabled={isWorking || !prefs.push_enabled}
                  className={cn(
                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    enabled && prefs.push_enabled ? "bg-terracotta" : "bg-sand",
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none inline-block h-5 w-5 rounded-full bg-cream shadow-sm transition-transform",
                      enabled && prefs.push_enabled ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      {isPending && (
        <div className="flex items-center gap-2 text-sm text-muted" aria-live="polite">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Guardando…
        </div>
      )}
    </div>
  );
}
