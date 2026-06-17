"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, ChevronRight, CheckCircle } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";

type Platform = "iphone" | "android" | "mac" | "windows";

const PLATFORM_LABELS: Record<Platform, string> = {
  iphone: "iPhone / iPad",
  android: "Android",
  mac: "Mac",
  windows: "Windows / PC",
};

const PLATFORM_STEPS: Record<Platform, string[]> = {
  iphone: [
    "Abre Home Hub en Safari (no Chrome ni Firefox).",
    "Pulsa el botón Compartir (cuadrado con flecha hacia arriba) en la barra inferior.",
    "Desplázate hacia abajo y pulsa «Añadir a la pantalla de inicio».",
    "Confirma el nombre y pulsa «Añadir».",
    "La app aparecerá en tu pantalla de inicio como cualquier otra aplicación.",
  ],
  android: [
    "Abre Home Hub en Chrome.",
    "Pulsa el menú de tres puntos (⋮) en la esquina superior derecha.",
    "Selecciona «Añadir a la pantalla de inicio» o «Instalar aplicación».",
    "Confirma la instalación.",
    "La app se añadirá a tu pantalla de inicio y al cajón de aplicaciones.",
  ],
  mac: [
    "Abre Home Hub en Safari.",
    "Ve al menú Archivo y selecciona «Añadir a Dock».",
    "Confirma el nombre y pulsa «Añadir».",
    "La app aparecerá en el Dock como una aplicación independiente.",
  ],
  windows: [
    "Abre Home Hub en Microsoft Edge o Google Chrome.",
    "Haz clic en el icono de instalación en la barra de direcciones (o en el menú del navegador).",
    "Selecciona «Instalar» o «Instalar aplicación».",
    "La app se instalará y aparecerá en el menú de inicio.",
  ],
};

export function InstallGuideView() {
  const [selected, setSelected] = useState<Platform>("iphone");

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardTitle>Instalar la app</CardTitle>
        <CardDescription>
          Añade Home Hub a tu pantalla de inicio para acceder más rápido y recibir notificaciones.
        </CardDescription>

        {/* Platform tabs */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(["iphone", "android", "mac", "windows"] as Platform[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelected(p)}
              className={[
                "flex min-h-[44px] items-center justify-center rounded-xl border px-3 py-2 text-sm font-medium transition-colors",
                selected === p
                  ? "border-terracotta bg-terracotta text-white"
                  : "border-sand bg-card text-brown hover:border-terracotta/50",
              ].join(" ")}
              aria-pressed={selected === p}
            >
              {PLATFORM_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Steps */}
        <ol className="mt-5 flex flex-col gap-3">
          {PLATFORM_STEPS[selected].map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-terracotta/10 text-xs font-bold text-terracotta">
                {i + 1}
              </span>
              <span className="text-sm text-brown leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      {/* Notifications requirement */}
      <Card>
        <div className="flex items-start gap-3">
          <Bell className="mt-0.5 h-5 w-5 shrink-0 text-terracotta" aria-hidden />
          <div>
            <CardTitle>Notificaciones push</CardTitle>
            <CardDescription className="mt-1">
              Para recibir notificaciones necesitas cumplir todos estos requisitos:
            </CardDescription>
          </div>
        </div>

        <ul className="mt-4 flex flex-col gap-3">
          {[
            {
              label: "App instalada en pantalla de inicio",
              detail:
                "En iPhone y iPad es obligatorio. Las notificaciones push en iOS sólo funcionan cuando la app está instalada (requiere iOS 16.4 o superior).",
            },
            {
              label: "Permiso de notificaciones concedido",
              detail:
                "El navegador o la app te preguntará si quieres permitir notificaciones. Debes aceptar.",
            },
            {
              label: "Notificaciones activadas en el sistema",
              detail:
                "Comprueba en Ajustes del dispositivo → Notificaciones que Home Hub tiene permiso para mostrar alertas.",
            },
            {
              label: "Navegador compatible",
              detail:
                "Safari en iPhone/iPad, Chrome o Edge en Android y escritorio. Firefox en iOS no soporta push.",
            },
          ].map((item) => (
            <li key={item.label} className="flex gap-3">
              <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-sage" aria-hidden />
              <div>
                <p className="text-sm font-medium text-brown">{item.label}</p>
                <p className="mt-0.5 text-xs text-muted leading-relaxed">{item.detail}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {/* Test notification CTA */}
      <Card className="p-0 overflow-hidden">
        <Link
          href="/ajustes/notificaciones"
          className="flex min-h-[56px] items-center justify-between gap-3 px-4 py-3 transition hover:bg-sand active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-terracotta/10">
              <Bell className="h-4 w-4 text-terracotta" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-medium text-brown">Probar notificación</p>
              <p className="text-xs text-muted">Verifica que las notificaciones llegan correctamente</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        </Link>
      </Card>

      {/* Platform-specific note */}
      {selected === "iphone" && (
        <div className="rounded-xl border border-amber/40 bg-amber/10 px-4 py-3 text-sm text-brown">
          <p className="font-medium">Nota sobre iPhone</p>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            Las notificaciones push en iPhone y iPad están disponibles a partir de iOS 16.4. Si
            tienes una versión anterior, actualiza el sistema para poder recibirlas.
          </p>
        </div>
      )}
    </div>
  );
}
