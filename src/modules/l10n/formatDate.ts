import type { DateLike } from "@/shared/types/DateLike";
import { capitalizeFirst } from "@/shared/utils/capitalizeFirst";
import { toCalendarDate } from "@/shared/utils/toCalendarDate";
import { getDateTimeFormat } from "./intlFormatterCache";
import { resolveFormattingLocale } from "./resolveFormattingLocale";

/** Presets legibles de fecha, de más a menos detalle. */
export type DateStyle = "full" | "long" | "medium" | "short" | "monthYear" | "monthDay" | "weekday";

/**
 * Presets de la app: solo eligen QUÉ campos muestra cada estilo. No es config por
 * país: son los mismos para todos los locales. `Intl` pone los nombres y el orden
 * según el idioma del sistema (en `es`: "25 de junio de 2026").
 */
const DATE_STYLE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
    full: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
    long: { day: "numeric", month: "long", year: "numeric" },
    medium: { day: "numeric", month: "short", year: "numeric" },
    short: { day: "2-digit", month: "2-digit", year: "numeric" },
    monthYear: { month: "long", year: "numeric" },
    monthDay: { day: "numeric", month: "long" },
    weekday: { weekday: "long" },
};

/**
 * Formatea una fecha al locale de formato activo. En español `Intl` devuelve meses
 * y días en minúscula; se capitaliza la inicial para usarlos como etiqueta.
 */
export function formatDate(value: DateLike, style: DateStyle = "long", localeOverride?: string): string {
    const locale = resolveFormattingLocale(localeOverride);
    const formatted = getDateTimeFormat(locale, DATE_STYLE_OPTIONS[style]).format(toCalendarDate(value));
    return capitalizeFirst(formatted);
}
