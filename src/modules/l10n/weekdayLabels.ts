import { getCalendars } from "expo-localization";

import { capitalizeFirst } from "@/shared/utils/capitalizeFirst";
import { getDateTimeFormat } from "./intlFormatterCache";
import { resolveFormattingLocale } from "./resolveFormattingLocale";

/** Ancho de la etiqueta del día: "L" / "lun." / "lunes". */
export type WeekdayStyle = "narrow" | "short" | "long";

// 2023-01-01 fue domingo: sirve de semana de referencia para recorrer los 7 días.
const REFERENCE_SUNDAY = new Date(2023, 0, 1);

/**
 * Etiquetas de los días de la semana en el orden local: respeta el primer día de
 * la semana del dispositivo (lunes en es/LatAm, domingo en en-US). Pensado para
 * cabeceras de calendario. `firstWeekday` de `expo-localization` es 1=domingo … 7=sábado.
 */
export function weekdayLabels(style: WeekdayStyle = "narrow", localeOverride?: string): string[] {
    const locale = resolveFormattingLocale(localeOverride);
    const formatter = getDateTimeFormat(locale, { weekday: style });
    const firstWeekday = getCalendars()[0].firstWeekday ?? 2;

    const labels: string[] = [];
    for (let offset = 0; offset < 7; offset += 1) {
        const dayIndex = (firstWeekday - 1 + offset) % 7;
        const date = new Date(REFERENCE_SUNDAY);
        date.setDate(REFERENCE_SUNDAY.getDate() + dayIndex);
        labels.push(capitalizeFirst(formatter.format(date)));
    }
    return labels;
}
