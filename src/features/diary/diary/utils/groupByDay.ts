import type { CheckinListItem } from "../services/listCheckins";

/**
 * Grupo de registros de un mismo día local. `items` preserva el orden de entrada
 * (descendente por `recordedAt`, garantizado por `listCheckins`), por lo que
 * `latest` siempre es el primer elemento.
 */
export type DayGroup = {
    /** `YYYY-MM-DD` del día agrupado. */
    localDate: string;
    /** Registros del día, orden desc por `recordedAt`. */
    items: CheckinListItem[];
    /** Registro más reciente del día (`items[0]`). */
    latest: CheckinListItem;
};

/**
 * Agrupa una lista de check-ins (ordenada desc por `recordedAt`) por `localDate`.
 * Devuelve los grupos ordenados descendente por fecha. Es una reducción pura,
 * sin dependencias de React, para facilitar tests unitarios.
 *
 * Si la entrada está vacía devuelve `[]`.
 */
export function groupByDay(items: CheckinListItem[]): DayGroup[] {
    if (items.length === 0) {
        return [];
    }

    const byDate = new Map<string, CheckinListItem[]>();
    for (const item of items) {
        const bucket = byDate.get(item.localDate);
        if (bucket) {
            bucket.push(item);
        } else {
            byDate.set(item.localDate, [item]);
        }
    }

    // El Map conserva el orden de inserción; como `items` viene ordenado desc por
    // recordedAt, la primera vez que vemos cada fecha es la más reciente, por lo
    // que las claves quedan en orden descendente naturalmente.
    return Array.from(byDate.entries()).map(([localDate, dayItems]) => ({
        localDate,
        items: dayItems,
        latest: dayItems[0]!,
    }));
}
