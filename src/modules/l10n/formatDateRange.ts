import type { DateLike } from "@/shared/types/DateLike";
import { toCalendarDate } from "@/shared/utils/toCalendarDate";
import { getDateTimeFormat } from "./intlFormatterCache";
import { resolveFormattingLocale } from "./resolveFormattingLocale";

/** Presets de rango de fechas (p. ej. ventana fértil, duración del periodo). */
export type DateRangeStyle = "monthDay" | "long" | "medium";

const DATE_RANGE_OPTIONS: Record<DateRangeStyle, Intl.DateTimeFormatOptions> = {
    monthDay: { day: "numeric", month: "long" },
    long: { day: "numeric", month: "long", year: "numeric" },
    medium: { day: "numeric", month: "short", year: "numeric" },
};

type WithFormatRange = Intl.DateTimeFormat & {
    formatRange?: (start: Date, end: Date) => string;
};

/**
 * Formatea un rango de fechas de forma compacta ("12–15 de junio"). Usa
 * `Intl.DateTimeFormat.formatRange` cuando está disponible; si el motor no lo
 * implementa, cae a un rango simple con guion.
 */
export function formatDateRange(
    start: DateLike,
    end: DateLike,
    style: DateRangeStyle = "monthDay",
    localeOverride?: string,
): string {
    const locale = resolveFormattingLocale(localeOverride);
    const formatter = getDateTimeFormat(locale, DATE_RANGE_OPTIONS[style]) as WithFormatRange;
    const from = toCalendarDate(start);
    const to = toCalendarDate(end);

    if (typeof formatter.formatRange === "function") {
        return formatter.formatRange(from, to);
    }
    return `${formatter.format(from)} – ${formatter.format(to)}`;
}
