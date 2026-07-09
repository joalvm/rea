import type { DateLike } from "../types/DateLike";

/**
 * Normaliza cualquier {@link DateLike} a un `Date`.
 *
 * Caso clave para un tracker de ciclo: las fechas "de calendario" se guardan como
 * `YYYY-MM-DD` (sin hora). Si se parsean con `new Date("2026-06-25")` el motor las
 * interpreta como **UTC medianoche**, y al pintarlas en husos al oeste de GMT
 * "retroceden" un día. Aquí las anclamos al **mediodía local**, que nunca cruza de
 * día por zona horaria.
 */
export function toCalendarDate(value: DateLike): Date {
    if (value instanceof Date) {
        return value;
    }

    if (typeof value === "number") {
        return new Date(value);
    }

    // ISO con hora ("2026-06-25T08:00:00Z"): respetar tal cual.
    if (value.includes("T")) {
        return new Date(value);
    }

    // Fecha de calendario "YYYY-MM-DD": anclar a mediodía local.
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year ?? 1970, (month ?? 1) - 1, day ?? 1, 12, 0, 0, 0);
}
