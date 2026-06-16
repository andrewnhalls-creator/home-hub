"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { CalendarEventForm } from "@/components/calendar/CalendarEventForm";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/app/(app)/calendario/actions";
import { cn } from "@/lib/utils";
import type { CalendarItem, CalendarItemType } from "@/lib/calendar";

interface CalendarViewProps {
  items: CalendarItem[];
}

type ViewMode = "mensual" | "semanal" | "proximos";

const TYPE_DOT_CLASS: Record<CalendarItemType, string> = {
  evento: "bg-terracotta",
  recordatorio: "bg-amber",
  tarea: "bg-olive",
  pago: "bg-rose",
  suscripcion: "bg-rose",
  documento: "bg-muted",
  comida: "bg-sage",
};

export function CalendarView({ items }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("mensual");
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CalendarItem | null>(null);

  const itemsByDate = useMemo(() => {
    const map = new Map<string, CalendarItem[]>();
    for (const item of items) {
      const list = map.get(item.date) ?? [];
      list.push(item);
      map.set(item.date, list);
    }
    return map;
  }, [items]);

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days: Date[] = [];
  for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) days.push(day);

  const weekDays: Date[] = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(cursor, { weekStartsOn: 1 }), i));

  const upcoming = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return [...items].filter((item) => item.date >= todayStr).sort((a, b) => a.date.localeCompare(b.date)).slice(0, 30);
  }, [items]);

  const selectedDayItems = selectedDate ? itemsByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto">
        {(["mensual", "semanal", "proximos"] as ViewMode[]).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setViewMode(mode)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium",
              viewMode === mode ? "bg-terracotta text-cream" : "bg-card text-muted",
            )}
          >
            {mode === "mensual" ? "Vista mensual" : mode === "semanal" ? "Vista semanal" : "Próximos eventos"}
          </button>
        ))}
      </div>

      {viewMode !== "proximos" && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => setCursor((d) => (viewMode === "mensual" ? subMonths(d, 1) : addDays(d, -7)))}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-sand"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <p className="text-sm font-medium capitalize text-brown">
            {viewMode === "mensual" ? format(cursor, "MMMM yyyy", { locale: es }) : `Semana del ${format(weekDays[0], "dd/MM")}`}
          </p>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => setCursor((d) => (viewMode === "mensual" ? addMonths(d, 1) : addDays(d, 7)))}
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted hover:bg-sand"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      )}

      {viewMode === "mensual" && (
        <div className="grid grid-cols-7 gap-1">
          {["L", "M", "X", "J", "V", "S", "D"].map((label) => (
            <div key={label} className="text-center text-xs font-medium text-muted">
              {label}
            </div>
          ))}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayItems = itemsByDate.get(dateStr) ?? [];
            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={cn(
                  "flex aspect-square flex-col items-center justify-start gap-1 rounded-lg p-1 text-xs",
                  !isSameMonth(day, cursor) && "opacity-40",
                  isToday(day) && "ring-2 ring-terracotta",
                )}
              >
                <span className="text-brown">{format(day, "d")}</span>
                <div className="flex flex-wrap justify-center gap-0.5">
                  {dayItems.slice(0, 3).map((item) => (
                    <span key={item.id} className={cn("h-1.5 w-1.5 rounded-full", TYPE_DOT_CLASS[item.type])} />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {viewMode === "semanal" && (
        <div className="flex flex-col gap-3">
          {weekDays.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dayItems = itemsByDate.get(dateStr) ?? [];
            return (
              <Card key={dateStr}>
                <p className="mb-2 text-sm font-semibold capitalize text-brown">
                  {format(day, "EEEE dd/MM", { locale: es })}
                </p>
                {dayItems.length === 0 ? (
                  <p className="text-xs text-muted">Sin eventos.</p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {dayItems.map((item) => (
                      <li key={item.id} className="flex items-center gap-2 text-sm text-brown">
                        <span className={cn("h-2 w-2 shrink-0 rounded-full", TYPE_DOT_CLASS[item.type])} />
                        {item.title}
                        {item.isPrivate && <Lock className="h-3 w-3 text-muted" aria-hidden />}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {viewMode === "proximos" && (
        <>
          {upcoming.length === 0 ? (
            <EmptyState title="Nada pendiente por ahora." description="Añade un evento para empezar." />
          ) : (
            <ul className="flex flex-col gap-3">
              {upcoming.map((item) => (
                <li key={item.id}>
                  <Card className="flex items-center gap-3">
                    <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", TYPE_DOT_CLASS[item.type])} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-brown">
                        {item.title}
                        {item.isPrivate && <Lock className="ml-1 inline h-3 w-3 text-muted" aria-hidden />}
                      </p>
                      <p className="text-xs text-muted">{format(new Date(`${item.date}T00:00:00`), "dd/MM/yyyy")}</p>
                    </div>
                    {item.type === "evento" && item.event && (
                      <Button type="button" variant="secondary" onClick={() => setEditingItem(item)}>
                        Editar
                      </Button>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-20 right-4 z-30 rounded-full px-5 shadow-md md:bottom-6"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Añadir evento
      </Button>

      <Modal isOpen={!!selectedDate} onClose={() => setSelectedDate(null)} title={selectedDate ? format(new Date(`${selectedDate}T00:00:00`), "dd/MM/yyyy") : ""}>
        {selectedDayItems.length === 0 ? (
          <p className="text-sm text-muted">Sin eventos este día.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {selectedDayItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-sm text-brown"
              >
                <span className={cn("h-2 w-2 shrink-0 rounded-full", TYPE_DOT_CLASS[item.type])} />
                {item.title}
                {item.isPrivate && <Lock className="h-3 w-3 text-muted" aria-hidden />}
                {item.type === "evento" && item.event && (
                  <button
                    type="button"
                    className="ml-auto text-xs font-medium text-terracotta"
                    onClick={() => {
                      setSelectedDate(null);
                      setEditingItem(item);
                    }}
                  >
                    Editar
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir evento">
        <CalendarEventForm
          action={createCalendarEvent}
          defaultDate={selectedDate ?? format(new Date(), "yyyy-MM-dd")}
          onSuccess={() => setIsAddOpen(false)}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Editar evento">
        {editingItem?.event && (
          <div className="flex flex-col gap-4">
            <CalendarEventForm
              action={updateCalendarEvent.bind(null, editingItem.event.id)}
              event={editingItem.event}
              onSuccess={() => setEditingItem(null)}
              onCancel={() => setEditingItem(null)}
            />
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                if (editingItem?.event) {
                  await deleteCalendarEvent(editingItem.event.id);
                  setEditingItem(null);
                }
              }}
            >
              Eliminar evento
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
