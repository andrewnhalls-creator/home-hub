"use client";

import Link from "next/link";
import { Fire, Trophy, ListChecks } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";
import { CompletionHeatmap } from "@/components/chores/CompletionHeatmap";

interface Cell {
  date: string;
  done: boolean;
}

interface ChoreHistoryProps {
  choreId: string;
  title: string;
  frequency: string | null;
  grid: Cell[];
  streaks: { current: number; longest: number };
  totalCompletions: number;
}

const FREQUENCY_LABEL: Record<string, string> = {
  puntual: "Puntual",
  diaria: "Diaria",
  semanal: "Semanal",
  quincenal: "Quincenal",
  mensual: "Mensual",
};

export function ChoreHistory({ title, frequency, grid, streaks, totalCompletions }: ChoreHistoryProps) {
  return (
    <div className="flex flex-col gap-5 px-4 pb-24 pt-4">
      <div className="flex items-center gap-3">
        <Link
          href="/tareas"
          className="text-sm font-medium text-terracotta"
          aria-label="Volver a tareas"
        >
          ← Volver
        </Link>
      </div>

      <div>
        <h1 className="text-xl font-semibold text-brown">{title}</h1>
        {frequency && (
          <p className="mt-0.5 text-sm text-muted">
            {FREQUENCY_LABEL[frequency] ?? frequency}
          </p>
        )}
      </div>

      {/* Streak stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="flex flex-col items-center gap-1 py-3 text-center">
          <Fire className="h-5 w-5 text-terracotta" aria-hidden />
          <p className="text-xl font-bold text-brown tabular-nums">{streaks.current}</p>
          <p className="text-xs text-muted">Racha actual</p>
        </Card>
        <Card className="flex flex-col items-center gap-1 py-3 text-center">
          <Trophy className="h-5 w-5 text-amber" aria-hidden />
          <p className="text-xl font-bold text-brown tabular-nums">{streaks.longest}</p>
          <p className="text-xs text-muted">Mejor racha</p>
        </Card>
        <Card className="flex flex-col items-center gap-1 py-3 text-center">
          <ListChecks className="h-5 w-5 text-sage" aria-hidden />
          <p className="text-xl font-bold text-brown tabular-nums">{totalCompletions}</p>
          <p className="text-xs text-muted">Completadas</p>
        </Card>
      </div>

      {/* Heatmap */}
      <Card>
        <p className="mb-3 text-sm font-medium text-brown">Últimas 12 semanas</p>
        {totalCompletions === 0 ? (
          <p className="text-sm text-muted">Aún no hay registros de esta tarea.</p>
        ) : (
          <CompletionHeatmap grid={grid} />
        )}
      </Card>
    </div>
  );
}
