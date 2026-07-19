import { parseReminderTime } from "@/shared/schemas/reminder/parseReminderTime";
import type { reminderIntervalHoursOptions } from "@/shared/schemas/reminder/reminderDefaults";

/** Horas válidas de intervalo entre recordatorios (3, 6, 12). */
export type ReminderIntervalHours = (typeof reminderIntervalHoursOptions)[number];

/** Un horario del día al que se programa un recordatorio. */
export type ReminderSlot = {
    hour: number;
    minute: number;
};

/**
 * Reparte slots dentro de una ventana horaria [`windowStart`, `windowEnd`),
 * separados por `intervalHours`. El primer slot cae en `windowStart` y el
 * último válido es estrictamente menor que `windowEnd` (un slot justo en el
 * cierre se descarta: la usuaria ya no quiere que le recordemos a esa hora).
 *
 * Puro: entra la configuración, sale la lista de horarios. Sin I/O, sin hora
 * actual — fácil de testear.
 */
export function computeReminderSlots(
    windowStart: string,
    windowEnd: string,
    intervalHours: ReminderIntervalHours,
): ReminderSlot[] {
    const start = parseReminderTime(windowStart);
    const end = parseReminderTime(windowEnd);

    if (start == null || end == null) {
        return [];
    }

    if (end.totalMinutes <= start.totalMinutes) {
        return [];
    }

    const intervalMinutes = intervalHours * 60;
    const slots: ReminderSlot[] = [];

    let cursor = start.totalMinutes;
    while (cursor < end.totalMinutes) {
        slots.push({ hour: Math.floor(cursor / 60), minute: cursor % 60 });
        cursor += intervalMinutes;
    }

    return slots;
}
