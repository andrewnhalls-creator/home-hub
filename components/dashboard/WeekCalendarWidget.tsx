"use client";

import Link from "next/link";
import { parse, format, isToday } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarDays } from "lucide-react";
import { WeekStrip } from "@/components/ui/WeekStrip";
import { Card, CardTitle } from "@/components/ui/Card";

interface CalendarEvent {
  id: string;
  title: string;
  event_date: string; // yyyy-MM-dd
}

interface WeekCalendarWidgetProps {
  weekStartStr: string; // yyyy-MM-dd — Monday of current week
  events: CalendarEvent[];
}

function parseLocalDate(str: string): Date {
  return parse(str, "yyyy-MM-dd", new Date());
}

export function WeekCalendarWidget({ weekStartStr, events }: WeekCalendarWidgetProps) {
  const monday = parseLocalDate(weekStartStr);
  const eventDates = events.map((e) => parseLocalDate(e.event_date));
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const upcoming = events
    .filter((e) => e.event_date >= todayStr)
    .slice(0, 3);

  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>Esta semana</CardTitle>
        <Link
          href="/calendario"
          className="text-sm font-medium text-terracotta hover:underline"
        >
          Ver calendario
        </Link>
      </div>

      <div className="mt-3">
        <WeekStrip weekStart={monday} eventDates={eventDates} />
      </div>

      {upcoming.length > 0 ? (
        <ul className="mt-4 flex flex-col divide-y divide-border">
          {upcoming.map((event) => {
            const eventDate = parseLocalDate(event.event_date);
            const todayEvent = isToday(eventDate);
            return (
              <li key={event.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-lg bg-terracotta/10">
                  <span className="text-[10px] font-semibold uppercase leading-none text-terracotta">
                    {format(eventDate, "MMM", { locale: es })}
                  </span>
                  <span className="text-sm font-bold leading-none text-terracotta">
                    {format(eventDate, "d")}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brown">{event.title}</p>
                  {todayEvent && (
                    <p className="text-xs text-terracotta">Hoy</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted">Sin eventos el resto de la semana.</p>
      )}

      <div className="mt-4 flex gap-3">
        <Link
          href="/calendario"
          className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-sand py-2.5 text-sm font-medium text-brown transition-colors hover:bg-border"
        >
          <CalendarDays className="h-4 w-4" aria-hidden />
          Ver todo
        </Link>
        <Link
          href="/calendario"
          className="flex flex-1 items-center justify-center rounded-xl bg-terracotta py-2.5 text-sm font-medium text-white transition-colors hover:bg-coral"
        >
          Añadir evento
        </Link>
      </div>
    </Card>
  );
}
