import type { DateLike } from "@/shared/types/DateLike";
import { startOfDay } from "@/shared/utils/startOfDay";
import { toCalendarDate } from "@/shared/utils/toCalendarDate";
import { getRelativeTimeFormat } from "./intlFormatterCache";
import { resolveFormattingLocale } from "./resolveFormattingLocale";

const MILLISECONDS_PER_DAY = 86_400_000;

const DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
    { amount: 60, unit: "second" },
    { amount: 60, unit: "minute" },
    { amount: 24, unit: "hour" },
    { amount: 7, unit: "day" },
    { amount: 4.34524, unit: "week" },
    { amount: 12, unit: "month" },
];

/**
 * Tiempo relativo legible respecto a `from` (por defecto, ahora): "hace 3 días",
 * "en 2 semanas". Elige automáticamente la unidad más natural. Para días de
 * calendario, `formatRelativeCalendarDay` prefiere "hoy/ayer/mañana".
 */
export function formatRelativeTime(value: DateLike, from: DateLike = new Date(), localeOverride?: string): string {
    const locale = resolveFormattingLocale(localeOverride);
    const formatter = getRelativeTimeFormat(locale);

    let duration = (toCalendarDate(value).getTime() - toCalendarDate(from).getTime()) / 1000;
    for (const division of DIVISIONS) {
        if (Math.abs(duration) < division.amount) {
            return formatter.format(Math.round(duration), division.unit);
        }
        duration /= division.amount;
    }
    return formatter.format(Math.round(duration), "year");
}

/**
 * Diferencia en días de calendario expresada en lenguaje natural: "hoy", "ayer",
 * "mañana", y a partir de ahí "hace N días" / "en N días". Ignora la hora.
 */
export function formatRelativeCalendarDay(
    value: DateLike,
    from: DateLike = new Date(),
    localeOverride?: string,
): string {
    const locale = resolveFormattingLocale(localeOverride);
    const target = startOfDay(toCalendarDate(value)).getTime();
    const base = startOfDay(toCalendarDate(from)).getTime();
    const days = Math.round((target - base) / MILLISECONDS_PER_DAY);
    return getRelativeTimeFormat(locale, { numeric: "auto" }).format(days, "day");
}
