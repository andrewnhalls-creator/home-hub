"use client";

import { Warning } from "@phosphor-icons/react";
import { Button } from "@/components/ui/Button";

interface ModuleErrorProps {
  reset: () => void;
}

export function ModuleError({ reset }: ModuleErrorProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/10">
        <Warning className="h-7 w-7 text-danger" aria-hidden />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-brown">Algo ha ido mal</p>
        <p className="text-sm text-muted">No se ha podido cargar esta sección.</p>
      </div>
      <Button variant="secondary" size="sm" onClick={reset}>
        Reintentar
      </Button>
    </div>
  );
}
