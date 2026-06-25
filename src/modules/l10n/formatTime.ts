import { getCalendars } from "expo-localization";

import type { DateLike } from "@/shared/types/DateLike";
import { toCalendarDate } from "@/shared/utils/toCalendarDate";
import { getDateTimeFormat } from "./intlFormatterCache";
import { resolveFormattingLocale } from "./resolveFormattingLocale";

/** Presets de hora (qué campos muestra). El reloj de 12/24 h lo decide el sistema. */
export type TimeStyle = "short" | "withSeconds";

const TIME_STYLE_OPTIONS: Record<TimeStyle, Intl.DateTimeFormatOptions> = {
    short: { hour: "2-digit", minute: "2-digit" },
    withSeconds: { hour: "2-digit", minute: "2-digit", second: "2-digit" },
};

/**
 * Reloj de 12/24 h tomado del ajuste del sistema de la usuaria (`uses24hourClock`
 * de `expo-localization`). Si el dispositivo no lo reporta, se asume 24 h (lo
 * habitual en los mercados de Rea).
 */
function deviceHour12(): boolean {
    return !(getCalendars()[0]?.uses24hourClock ?? true);
}

/** Formatea la hora de una fecha al locale de formato activo. */
export function formatTime(value: DateLike, style: TimeStyle = "short", localeOverride?: string): string {
    const locale = resolveFormattingLocale(localeOverride);
    const options = { ...TIME_STYLE_OPTIONS[style], hour12: deviceHour12() };
    return getDateTimeFormat(locale, options).format(toCalendarDate(value));
}
