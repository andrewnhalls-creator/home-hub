"use client";

import { Download, FileJson, FileSpreadsheet, ShieldCheck } from "lucide-react";
import { Card, CardTitle, CardDescription } from "@/components/ui/Card";

function ExportButton({
  href,
  icon,
  label,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <a
      href={href}
      download
      className="flex items-center gap-4 rounded-xl border border-sand bg-cream px-4 py-3 hover:border-terracotta/50 hover:bg-terracotta/5 transition-colors"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sage/20 text-sage">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-medium text-brown">{label}</span>
        <span className="text-xs text-muted">{description}</span>
      </div>
      <Download className="h-4 w-4 text-muted shrink-0" aria-hidden />
    </a>
  );
}

export function PrivacidadView() {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-sage" aria-hidden />
          <div>
            <CardTitle>Privacidad y datos</CardTitle>
            <CardDescription className="mt-1">
              Tus datos se almacenan de forma segura y solo tú y tu pareja tenéis acceso a ellos.
              Puedes exportar una copia completa en cualquier momento.
            </CardDescription>
          </div>
        </div>
      </Card>

      <Card>
        <CardTitle>Exportar datos</CardTitle>
        <CardDescription>
          Descarga una copia de los datos de tu hogar. Los eventos privados del calendario no se
          incluyen.
        </CardDescription>

        <div className="mt-4 flex flex-col gap-3">
          <ExportButton
            href="/api/ajustes/exportar?formato=json"
            icon={<FileJson className="h-5 w-5" />}
            label="Exportar todo (JSON)"
            description="Todos los módulos: compra, menú, finanzas, recordatorios, tareas, calendario, documentos y deseos."
          />
          <ExportButton
            href="/api/ajustes/exportar?formato=csv"
            icon={<FileSpreadsheet className="h-5 w-5" />}
            label="Exportar finanzas (CSV)"
            description="Gastos, pagos fijos, metas de ahorro y listas de la compra — compatible con Excel y Google Sheets."
          />
        </div>
      </Card>

      <Card>
        <CardTitle>Sobre tus datos</CardTitle>
        <ul className="mt-3 flex flex-col gap-2 text-sm text-brown">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-terracotta shrink-0" aria-hidden />
            Los datos del hogar se comparten entre ambos miembros.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-terracotta shrink-0" aria-hidden />
            Los eventos de calendario marcados como privados solo los ves tú.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-terracotta shrink-0" aria-hidden />
            Las notificaciones push llegan solo a tus dispositivos registrados.
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-terracotta shrink-0" aria-hidden />
            No compartimos tus datos con terceros ni integramos servicios bancarios.
          </li>
        </ul>
      </Card>
    </div>
  );
}
