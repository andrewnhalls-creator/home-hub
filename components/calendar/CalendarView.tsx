"use client";

import { useMemo, useState, useTransition } from "react";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  parse,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Plus, Lock, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { WeekStrip } from "@/components/ui/WeekStrip";
import { useToast } from "@/components/ui/Toast";
import { CalendarEventForm } from "@/components/calendar/CalendarEventForm";
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from "@/app/(app)/calendario/actions";
import { cn } from "@/lib/utils";
import type { CalendarItem, CalendarItemType } from "@/lib/calendar";

interface CalendarViewProps {
  items: CalendarItem[];
}

type ViewMode = "semanal" | "mensual" | "agenda";

const VIEW_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: "semanal", label: "Semana" },
  { value: "mensual", label: "Mes" },
  { value: "agenda", label: "Agenda" },
];

const TYPE_DOT_CLASS: Record<CalendarItemType, string> = {
  evento: "bg-terracotta",
  recordatorio: "bg-amber",
  tarea: "bg-olive",
  pago: "bg-rose",
  suscripcion: "bg-rose",
  documento: "bg-muted",
  comida: "bg-sage",
};

const TYPE_LABEL: Record<CalendarItemType, string> = {
  evento: "Evento",
  recordatorio: "Recordatorio",
  tarea: "Tarea",
  pago: "Pago fijo",
  suscripcion: "Suscripción",
  documento: "Documento",
  comida: "Comida",
};

export function CalendarView({ items }: CalendarViewProps) {
  const { showToast } = useToast();
  const [, startTransition] = useTransition();
  const [viewMode, setViewMode] = useState<ViewMode>("semanal");
  const [cursor, setCursor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedWeekDay, setSelectedWeekDay] = useState<string>(() =>
    format(new Date(), "yyyy-MM-dd"),
  );
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

  // ── Month view geometry ──────────────────────────────────────────────────
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays: Date[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) monthDays.push(d);

  // ── Week view geometry ───────────────────────────────────────────────────
  const weekMonday = startOfWeek(cursor, { weekStartsOn: 1 });
  const weekMondayStr = format(weekMonday, "yyyy-MM-dd");
  const weekSundayStr = format(addDays(weekMonday, 6), "yyyy-MM-dd");

  // If the selected day isn't in the visible week, fall back to Monday
  const effectiveWeekDay =
    selectedWeekDay >= weekMondayStr && selectedWeekDay <= weekSundayStr
      ? selectedWeekDay
      : weekMondayStr;

  const weekEventDates = useMemo(() => {
    const monday = startOfWeek(cursor, { weekStartsOn: 1 });
    const mondayStr = format(monday, "yyyy-MM-dd");
    const sundayStr = format(addDays(monday, 6), "yyyy-MM-dd");
    const dates: Date[] = [];
    for (const [dateStr, dayItems] of itemsByDate) {
      if (dateStr >= mondayStr && dateStr <= sundayStr && dayItems.length > 0) {
        dates.push(parse(dateStr, "yyyy-MM-dd", new Date()));
      }
    }
    return dates;
  }, [itemsByDate, cursor]);

  const selectedWeekDayItems = itemsByDate.get(effectiveWeekDay) ?? [];

  const selectedWeekDayLabel = (() => {
    const d = parse(effectiveWeekDay, "yyyy-MM-dd", new Date());
    if (isToday(d)) return "Hoy";
    const raw = format(d, "EEEE d 'de' MMMM", { locale: es });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })();

  // ── Navigation helpers ───────────────────────────────────────────────────
  const navWeek = (dir: 1 | -1) => {
    const newCursor = addDays(cursor, dir * 7);
    const newMonday = startOfWeek(newCursor, { weekStartsOn: 1 });
    setCursor(newCursor);
    setSelectedWeekDay(format(newMonday, "yyyy-MM-dd"));
  };

  const weekNavLabel = (() => {
    const sunday = addDays(weekMonday, 6);
    const sameMonth = format(weekMonday, "M") === format(sunday, "M");
    if (sameMonth) {
      const raw = `${format(weekMonday, "d")}–${format(sunday, "d 'de' MMMM yyyy", { locale: es })}`;
      return raw.charAt(0).toUpperCase() + raw.slice(1);
    }
    return `${format(weekMonday, "d MMM", { locale: es })} – ${format(sunday, "d MMM yyyy", { locale: es })}`;
  })();

  const monthNavLabel = (() => {
    const raw = format(cursor, "MMMM yyyy", { locale: es });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })();

  // ── Agenda list ──────────────────────────────────────────────────────────
  const upcoming = useMemo(() => {
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return [...items]
      .filter((item) => item.date >= todayStr)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, 30);
  }, [items]);

  const selectedDayItems = selectedDate ? itemsByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="flex flex-col gap-4">
      {/* View selector */}
      <SegmentedControl
        options={VIEW_OPTIONS}
        value={viewMode}
        onChange={setViewMode}
        aria-label="Vista del calendario"
      />

      {/* ── Week view ─────────────────────────────────────────────────── */}
      {viewMode === "semanal" && (
        <>
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Semana anterior"
              onClick={() => navWeek(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-sand active:bg-sand"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <p className="text-sm font-medium text-brown">{weekNavLabel}</p>
            <button
              type="button"
              aria-label="Semana siguiente"
              onClick={() => navWeek(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-sand active:bg-sand"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <Card>
            <WeekStrip
              weekStart={weekMonday}
              selectedDate={parse(effectiveWeekDay, "yyyy-MM-dd", new Date())}
              onDateSelect={(d) => setSelectedWeekDay(format(d, "yyyy-MM-dd"))}
              eventDates={weekEventDates}
            />

            <div className="mt-4 border-t border-border pt-4">
              <p className="mb-3 text-sm font-semibold text-brown">{selectedWeekDayLabel}</p>

              {selectedWeekDayItems.length === 0 ? (
                <p className="text-sm text-muted">Sin eventos este día.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {selectedWeekDayItems.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-xl border border-border bg-sand px-3 py-2.5"
                    >
                      <span
                        className={cn("h-2 w-2 shrink-0 rounded-full", TYPE_DOT_CLASS[item.type])}
                        aria-hidden
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-brown">
                          {item.title}
                          {item.isPrivate && (
                            <Lock className="ml-1 inline h-3 w-3 text-muted" aria-label="Privado" />
                          )}
                        </p>
                        <p className="text-xs text-muted">{TYPE_LABEL[item.type]}</p>
                      </div>
                      {item.type === "evento" && item.event && (
                        <button
                          type="button"
                          onClick={() => setEditingItem(item)}
                          className="shrink-0 min-h-[44px] px-2 text-xs font-medium text-terracotta hover:underline active:opacity-70"
                        >
                          Editar
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        </>
      )}

      {/* ── Month view ────────────────────────────────────────────────── */}
      {viewMode === "mensual" && (
        <>
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Mes anterior"
              onClick={() => setCursor((d) => subMonths(d, 1))}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-sand active:bg-sand"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <p className="text-sm font-medium text-brown">{monthNavLabel}</p>
            <button
              type="button"
              aria-label="Mes siguiente"
              onClick={() => setCursor((d) => addMonths(d, 1))}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-sand active:bg-sand"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1">
            {["L", "M", "X", "J", "V", "S", "D"].map((label) => (
              <div key={label} className="text-center text-xs font-medium text-muted py-1">
                {label}
              </div>
            ))}
            {monthDays.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const dayItems = itemsByDate.get(dateStr) ?? [];
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDate(dateStr)}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-start gap-1 rounded-lg p-1 text-xs transition-colors hover:bg-sand",
                    !isSameMonth(day, cursor) && "opacity-40",
                    isToday(day) && "ring-2 ring-terracotta ring-offset-1",
                  )}
                >
                  <span className={cn("font-medium", isToday(day) ? "text-terracotta" : "text-brown")}>
                    {format(day, "d")}
                  </span>
                  <div className="flex flex-wrap justify-center gap-0.5">
                    {dayItems.slice(0, 3).map((item) => (
                      <span
                        key={item.id}
                        className={cn("h-1.5 w-1.5 rounded-full", TYPE_DOT_CLASS[item.type])}
                        aria-hidden
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ── Agenda view ───────────────────────────────────────────────── */}
      {viewMode === "agenda" && (
        <>
          {upcoming.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Nada pendiente por ahora."
              description="Añade un evento para empezar."
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {upcoming.map((item) => (
                <li key={item.id}>
                  <Card className="flex items-center gap-3 p-3">
                    <div className="flex h-10 w-10 shrink-0 flex-col items-center justify-center rounded-lg bg-terracotta/10">
                      <span className="text-[10px] font-semibold uppercase leading-none text-terracotta">
                        {format(new Date(`${item.date}T00:00:00`), "MMM", { locale: es })}
                      </span>
                      <span className="text-sm font-bold leading-none text-terracotta">
                        {format(new Date(`${item.date}T00:00:00`), "d")}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-brown">
                        {item.title}
                        {item.isPrivate && (
                          <Lock className="ml-1 inline h-3 w-3 text-muted" aria-label="Privado" />
                        )}
                      </p>
                      <p className="text-xs text-muted">{TYPE_LABEL[item.type]}</p>
                    </div>
                    {item.type === "evento" && item.event && (
                      <button
                        type="button"
                        onClick={() => setEditingItem(item)}
                        className="shrink-0 text-xs font-medium text-terracotta hover:underline"
                      >
                        Editar
                      </button>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* ── FAB ───────────────────────────────────────────────────────── */}
      <Button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-20 right-4 z-30 rounded-full px-5 shadow-md md:bottom-6"
        aria-label="Añadir evento"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Añadir evento
      </Button>

      {/* ── Month day detail modal ────────────────────────────────────── */}
      <Modal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={
          selectedDate
            ? format(new Date(`${selectedDate}T00:00:00`), "EEEE d 'de' MMMM", { locale: es })
                .replace(/^\w/, (c) => c.toUpperCase())
            : ""
        }
      >
        {selectedDayItems.length === 0 ? (
          <p className="text-sm text-muted">Sin eventos este día.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {selectedDayItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-brown"
              >
                <span className={cn("h-2 w-2 shrink-0 rounded-full", TYPE_DOT_CLASS[item.type])} aria-hidden />
                <span className="min-w-0 flex-1 truncate">{item.title}</span>
                {item.isPrivate && <Lock className="h-3 w-3 shrink-0 text-muted" aria-label="Privado" />}
                {item.type === "evento" && item.event && (
                  <button
                    type="button"
                    className="shrink-0 text-xs font-medium text-terracotta"
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

      {/* ── Add event modal ───────────────────────────────────────────── */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Añadir evento">
        <CalendarEventForm
          action={createCalendarEvent}
          defaultDate={selectedDate ?? format(new Date(), "yyyy-MM-dd")}
          onSuccess={() => {
            setIsAddOpen(false);
            showToast("Evento añadido");
          }}
          onCancel={() => setIsAddOpen(false)}
        />
      </Modal>

      {/* ── Edit event modal ──────────────────────────────────────────── */}
      <Modal isOpen={!!editingItem} onClose={() => setEditingItem(null)} title="Editar evento">
        {editingItem?.event && (
          <div className="flex flex-col gap-4">
            <CalendarEventForm
              action={updateCalendarEvent.bind(null, editingItem.event.id)}
              event={editingItem.event}
              onSuccess={() => {
                setEditingItem(null);
                showToast("Evento actualizado");
              }}
              onCancel={() => setEditingItem(null)}
            />
            <Button
              type="button"
              variant="danger"
              onClick={() => {
                if (editingItem?.event) {
                  const id = editingItem.event.id;
                  startTransition(async () => {
                    await deleteCalendarEvent(id);
                    setEditingItem(null);
                    showToast("Evento eliminado");
                  });
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
