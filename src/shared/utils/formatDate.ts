/**
 * Utilidades de formato de fecha para UI, dependientes de i18next para los
 * nombres de mes y día de la semana. Todas operan sobre `YYYY-MM-DD` (el formato
 * canónico `localDate` del dominio) y devuelven strings listos para mostrar.
 */
import type { TFunction } from "i18next";

import { isoToYMD } from "./ymd";

/**
 * Devuelve el día del mes (1-31) como número a partir de un `YYYY-MM-DD`.
 */
export function dayOfMonth(iso: string): number {
    return isoToYMD(iso).day;
}

/**
 * Devuelve la clave del día de la semana (0-6, domingo=0) como string, lista
 * para usar con `t("diary:weekdays.<key>")`. Usa UTC para evitar saltos por
 * huso horario al parsear un `YYYY-MM-DD`.
 */
export function weekdayKey(iso: string): string {
    const { year, month, day } = isoToYMD(iso);
    const date = new Date(Date.UTC(year, month - 1, day));
    return String(date.getUTCDay());
}

/**
 * Etiqueta larga de un `YYYY-MM-DD`: "sábado 12 de julio". Usa las claves
 * `diary:weekdays` y `diary:months` del namespace `diary`.
 */
export function formatLongDate(t: TFunction, iso: string): string {
    const wd = t(`diary:weekdays.${weekdayKey(iso)}`);
    const mon = t(`diary:months.${String(isoToYMD(iso).month)}`);
    return `${wd} ${isoToYMD(iso).day} de ${mon}`;
}

/**
 * Etiqueta corta de un `YYYY-MM-DD` para la lista del diario: "sábado 12".
 */
export function formatShortDate(t: TFunction, iso: string): string {
    const wd = t(`diary:weekdays.${weekdayKey(iso)}`);
    return `${wd} ${isoToYMD(iso).day}`;
}

/**
 * Extrae la hora `HH:MM` de un timestamp ISO (`recordedAt`).
 */
export function extractTime(isoTimestamp: string): string {
    // `recordedAt` es ISO 8601 (ej. "2026-06-02T10:00:00Z"); tomamos los 5
    // caracteres de hora:minuto de la parte horaria.
    const timePart = isoTimestamp.split("T")[1];
    if (!timePart) {
        return "--:--";
    }
    return timePart.slice(0, 5);
}
