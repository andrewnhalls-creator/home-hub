"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { CalendarEventFormState } from "@/app/(app)/calendario/actions";
import type { CalendarEvent, RepeatFrequency } from "@/lib/types";

interface CalendarEventFormProps {
  action: (prevState: CalendarEventFormState, formData: FormData) => Promise<CalendarEventFormState>;
  event?: CalendarEvent;
  defaultDate?: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const initialState: CalendarEventFormState = {};

const REPEAT_OPTIONS = [
  { value: "ninguna", label: "Ninguna" },
  { value: "diaria", label: "Diaria" },
  { value: "semanal", label: "Semanal" },
  { value: "mensual", label: "Mensual" },
  { value: "anual", label: "Anual" },
];

const REMIND_OPTIONS = [
  { value: "0", label: "En el momento" },
  { value: "10", label: "10 minutos antes" },
  { value: "30", label: "30 minutos antes" },
  { value: "60", label: "1 hora antes" },
  { value: "1440", label: "1 día antes" },
];

const EVENT_COLORS = [
  "#c55535", // terracotta
  "#d9704e", // coral
  "#c99a2e", // amber
  "#42795a", // sage
  "#3d6443", // olive
  "#a86040", // rose
  "#7a4060", // plum
  "#b03030", // crimson
];

export function CalendarEventForm({
  action,
  event,
  defaultDate,
  onSuccess,
  onCancel,
}: CalendarEventFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [isAllDay, setIsAllDay] = useState(event?.is_all_day ?? false);
  const [repeatFrequency, setRepeatFrequency] = useState<RepeatFrequency>(event?.repeat_frequency ?? "ninguna");
  const [selectedColor, setSelectedColor] = useState<string>(event?.color ?? "");

  useEffect(() => {
    if (state.success) onSuccess();
  }, [state.success, onSuccess]);

  const showEndDate = repeatFrequency === "ninguna";

  return (
    <form action={formAction} noValidate className="flex flex-col gap-4">
      <Input
        label="Título"
        name="title"
        required
        defaultValue={event?.title}
        error={state.fieldErrors?.title}
      />
      <Textarea label="Descripción" name="description" defaultValue={event?.description ?? undefined} />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Fecha de inicio"
          name="eventDate"
          type="date"
          required
          defaultValue={event?.event_date ?? defaultDate}
          error={state.fieldErrors?.eventDate}
        />
        {showEndDate ? (
          <Input
            label="Fecha de fin"
            name="endDate"
            type="date"
            defaultValue={event?.end_date ?? undefined}
            error={state.fieldErrors?.endDate}
          />
        ) : (
          <Input
            label="Hora"
            name="eventTime"
            type="time"
            defaultValue={event?.event_time ?? undefined}
            disabled={isAllDay}
          />
        )}
      </div>

      {showEndDate && (
        <Input
          label="Hora"
          name="eventTime"
          type="time"
          defaultValue={event?.event_time ?? undefined}
          disabled={isAllDay}
        />
      )}

      <Checkbox
        label="Todo el día"
        name="isAllDay"
        defaultChecked={event?.is_all_day}
        onChange={(e) => setIsAllDay(e.target.checked)}
      />

      <Select
        label="Repetición"
        name="repeatFrequency"
        defaultValue={event?.repeat_frequency ?? "ninguna"}
        options={REPEAT_OPTIONS}
        onChange={(e) => setRepeatFrequency(e.target.value as RepeatFrequency)}
      />

      <Select
        label="Avisarme antes"
        name="remindBeforeMinutes"
        placeholder="Sin aviso"
        defaultValue={event?.remind_before_minutes != null ? String(event.remind_before_minutes) : ""}
        options={REMIND_OPTIONS}
      />

      {/* Colour picker */}
      <div>
        <p className="mb-1.5 text-sm font-medium text-brown">Color</p>
        <input type="hidden" name="color" value={selectedColor} />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedColor("")}
            aria-label="Sin color"
            aria-pressed={!selectedColor}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-full border-2 bg-card text-muted",
              !selectedColor ? "border-terracotta" : "border-border",
            )}
          >
            <span className="text-xs leading-none">–</span>
          </button>
          {EVENT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setSelectedColor(c)}
              aria-label={`Color ${c}`}
              aria-pressed={selectedColor === c}
              className={cn(
                "h-7 w-7 rounded-full border-2 transition-transform active:scale-90",
                selectedColor === c ? "border-terracotta scale-110" : "border-transparent",
              )}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>

      <Checkbox label="Evento privado" name="isPrivate" defaultChecked={event?.is_private} />
      <Textarea label="Notas" name="notes" defaultValue={event?.notes ?? undefined} />

      {state.error && <p className="text-sm text-danger">{state.error}</p>}

      <div className="mt-2 flex gap-3">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" isLoading={isPending}>
          Guardar evento
        </Button>
      </div>
    </form>
  );
}
