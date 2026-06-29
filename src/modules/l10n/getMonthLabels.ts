import { getDateTimeFormat } from "./intlFormatterCache";
import { resolveFormattingLocale } from "./resolveFormattingLocale";

const monthLabelsCache = new Map<string, readonly string[]>();

/** Devuelve los 12 nombres de mes en el locale de formato activo. */
export function getMonthLabels(localeOverride?: string): readonly string[] {
    const locale = resolveFormattingLocale(localeOverride);
    const cached = monthLabelsCache.get(locale);

    if (cached) {
        return cached;
    }

    const formatter = getDateTimeFormat(locale, { month: "long", timeZone: "UTC" });
    const labels = Array.from({ length: 12 }, (_, index) => formatter.format(new Date(Date.UTC(2026, index, 1))));

    monthLabelsCache.set(locale, labels);
    return labels;
}
