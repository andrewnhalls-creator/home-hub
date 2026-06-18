"use client";

import { useActionState, useTransition } from "react";
import { DeviceMobile, Trash, Warning, SpeakerHigh, SpeakerSlash, Vibrate, type Icon } from "@phosphor-icons/react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";
import { removeDevice, removeAllDevices, updateSubscriptionPrefs } from "@/app/(app)/ajustes/dispositivos/actions";
import type { DevicesActionState } from "@/app/(app)/ajustes/dispositivos/actions";

interface Subscription {
  id: string;
  device_name: string | null;
  user_agent: string | null;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  deactivated_at: string | null;
  sound_enabled: boolean;
  vibration_enabled: boolean;
}

interface DevicesViewProps {
  subscriptions: Subscription[];
}

const initialState: DevicesActionState = {};

function DeviceRow({ sub }: { sub: Subscription }) {
  const [state, formAction, pending] = useActionState(removeDevice, initialState);
  const [, startTransition] = useTransition();

  const label = sub.device_name || deriveDeviceName(sub.user_agent);
  const lastSeen = sub.last_seen_at
    ? new Date(sub.last_seen_at).toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
    : null;

  function togglePref(pref: "sound_enabled" | "vibration_enabled", current: boolean) {
    startTransition(async () => {
      await updateSubscriptionPrefs(sub.id, { [pref]: !current });
    });
  }

  return (
    <li className="flex flex-col gap-2 py-3 border-b border-sand last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sage/20">
            <DeviceMobile className="h-4 w-4 text-sage" aria-hidden />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-brown">{label}</span>
            {lastSeen && (
              <span className="text-xs text-muted">Último acceso: {lastSeen}</span>
            )}
            {!sub.is_active && sub.deactivated_at && (
              <span className="text-xs text-danger">
                Revocado el{" "}
                {new Date(sub.deactivated_at).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}
            {state?.error && (
              <span className="text-xs text-danger">{state.error}</span>
            )}
          </div>
        </div>

        {sub.is_active && (
          <form action={formAction}>
            <input type="hidden" name="subscriptionId" value={sub.id} />
            <button
              type="submit"
              disabled={pending}
              aria-label={`Quitar ${label}`}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-danger hover:bg-danger/10 disabled:opacity-50"
            >
              <Trash className="h-4 w-4" aria-hidden />
            </button>
          </form>
        )}
      </div>

      {/* Per-device sound / vibration toggles (active devices only) */}
      {sub.is_active && (
        <div className="ml-11 flex gap-2">
          <button
            type="button"
            aria-pressed={sub.sound_enabled}
            aria-label={sub.sound_enabled ? "Desactivar sonido" : "Activar sonido"}
            onClick={() => togglePref("sound_enabled", sub.sound_enabled)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition active:scale-[0.97]",
              sub.sound_enabled
                ? "border-terracotta/30 bg-terracotta/10 text-terracotta"
                : "border-border bg-card text-muted",
            )}
          >
            {sub.sound_enabled
              ? <SpeakerHigh className="h-3.5 w-3.5" aria-hidden />
              : <SpeakerSlash className="h-3.5 w-3.5" aria-hidden />
            }
            Sonido
          </button>
          <button
            type="button"
            aria-pressed={sub.vibration_enabled}
            aria-label={sub.vibration_enabled ? "Desactivar vibración" : "Activar vibración"}
            onClick={() => togglePref("vibration_enabled", sub.vibration_enabled)}
            className={cn(
              "flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition active:scale-[0.97]",
              sub.vibration_enabled
                ? "border-terracotta/30 bg-terracotta/10 text-terracotta"
                : "border-border bg-card text-muted",
            )}
          >
            <Vibrate className="h-3.5 w-3.5" aria-hidden />
            Vibración
          </button>
        </div>
      )}
    </li>
  );
}

function RevokeAllForm() {
  const [state, formAction, pending] = useActionState(
    () => removeAllDevices(),
    initialState,
  );

  return (
    <form action={formAction} className="mt-2">
      {state?.error && (
        <p className="mb-2 text-sm text-danger">{state.error}</p>
      )}
      <Button type="submit" variant="danger" disabled={pending} className="w-full">
        Revocar acceso a todos los dispositivos
      </Button>
    </form>
  );
}

function deriveDeviceName(userAgent: string | null): string {
  if (!userAgent) return "Dispositivo desconocido";
  if (/iPhone/.test(userAgent)) return "iPhone";
  if (/iPad/.test(userAgent)) return "iPad";
  if (/Android/.test(userAgent)) return "Android";
  if (/Macintosh/.test(userAgent)) return "Mac";
  if (/Windows/.test(userAgent)) return "Windows";
  return "Dispositivo";
}

export function DevicesView({ subscriptions }: DevicesViewProps) {
  const active = subscriptions.filter((s) => s.is_active);
  const inactive = subscriptions.filter((s) => !s.is_active);

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardTitle>Dispositivos activos</CardTitle>
        <CardDescription>
          Dispositivos que pueden recibir notificaciones push en tu cuenta.
        </CardDescription>

        {active.length === 0 ? (
          <div className="mt-3">
            <EmptyState
              icon={DeviceMobile as Icon}
              title="Sin dispositivos"
              description="Activa las notificaciones en Ajustes → Notificaciones para registrar este dispositivo."
            />
          </div>
        ) : (
          <ul className="mt-3">
            {active.map((sub) => (
              <DeviceRow key={sub.id} sub={sub} />
            ))}
          </ul>
        )}

        {active.length > 1 && (
          <div className="mt-3 border-t border-sand pt-3">
            <div className="flex items-start gap-2 text-xs text-muted">
              <Warning className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" aria-hidden />
              <span>
                Quitar todos los dispositivos desactivará las notificaciones push en todos ellos.
              </span>
            </div>
            <RevokeAllForm />
          </div>
        )}
      </Card>

      {inactive.length > 0 && (
        <Card>
          <CardTitle>Acceso revocado</CardTitle>
          <CardDescription>Dispositivos que ya no reciben notificaciones.</CardDescription>
          <ul className="mt-3">
            {inactive.map((sub) => (
              <DeviceRow key={sub.id} sub={sub} />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
