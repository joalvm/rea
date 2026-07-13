import { useCallback, useMemo, useState } from "react";

import { todayYMD, type YMD, ymdToISO } from "@/shared/utils/ymd";

export type MonthCursor = {
    /** Año+mes seleccionados. `day` siempre es 1. */
    cursor: YMD;
    /** `[from, to]` (`YYYY-MM-DD`) cubriendo todo el mes del cursor. */
    range: { from: string; to: string };
    /** Etiqueta legible: clave de mes (número 1-12 como string para i18n) + año. */
    label: { month: string; year: number };
    /** Avanza al mes siguiente. */
    next: () => void;
    /** Retrocede al mes anterior. */
    prev: () => void;
    /** Vuelve al mes actual (hoy). */
    reset: () => void;
    /** `true` si el cursor es el mes de hoy. */
    isCurrent: boolean;
};

/**
 * Normaliza un `YMD` al primer día del mes, conservando año y mes.
 */
function firstOfMonth(ymd: YMD): YMD {
    return { year: ymd.year, month: ymd.month, day: 1 };
}

/**
 * Devuelve el último día (1-31) de un mes concreto.
 */
function lastDayOfMonth(year: number, month: number): number {
    // `new Date(year, month, 0)` devuelve el último día del mes anterior al
    // `month` (1-12) dado, es decir, el último día de `month`.
    return new Date(year, month, 0).getDate();
}

/**
 * Hook de estado para el selector de mes del diario. Mantiene un cursor `YMD`
 * (día 1 del mes) y expone navegación `prev`/`next`/`reset` más el rango
 * `[from, to]` que cubre todo el mes, listo para pasarlo a `useCheckins`.
 */
export function useMonthCursor(initial?: YMD): MonthCursor {
    const [cursor, setCursor] = useState<YMD>(() => firstOfMonth(initial ?? todayYMD()));
    const today = todayYMD();
    const isCurrent = cursor.year === today.year && cursor.month === today.month;

    const prev = useCallback(() => {
        setCursor((current) => {
            const month = current.month - 1;
            if (month < 1) {
                return { year: current.year - 1, month: 12, day: 1 };
            }
            return { year: current.year, month, day: 1 };
        });
    }, []);

    const next = useCallback(() => {
        setCursor((current) => {
            const month = current.month + 1;
            if (month > 12) {
                return { year: current.year + 1, month: 1, day: 1 };
            }
            return { year: current.year, month, day: 1 };
        });
    }, []);

    const reset = useCallback(() => {
        setCursor(firstOfMonth(todayYMD()));
    }, []);

    const range = useMemo(
        () => ({
            from: ymdToISO({ year: cursor.year, month: cursor.month, day: 1 }),
            to: ymdToISO({ year: cursor.year, month: cursor.month, day: lastDayOfMonth(cursor.year, cursor.month) }),
        }),
        [cursor.year, cursor.month],
    );

    const label = useMemo(
        () => ({ month: String(cursor.month), year: cursor.year }),
        [cursor.month, cursor.year],
    );

    return { cursor, range, label, prev, next, reset, isCurrent };
}
