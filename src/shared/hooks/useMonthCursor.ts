import { useState } from "react";

import { todayYMD, type YMD, ymdToISO } from "@/shared/utils/ymd";

export type MonthCursor = {
    cursor: YMD;
    range: { from: string; to: string };
    prev: () => void;
    next: () => void;
    reset: () => void;
    isCurrent: boolean;
};

function firstOfMonth(ymd: YMD): YMD {
    return { year: ymd.year, month: ymd.month, day: 1 };
}

function lastDayOfMonth(year: number, month: number): number {
    return new Date(year, month, 0).getDate();
}

/** Cursor de mes sin dominio. Diario y calendario comparten la misma navegación y rango. */
export function useMonthCursor(initial?: YMD): MonthCursor {
    const [cursor, setCursor] = useState<YMD>(() => firstOfMonth(initial ?? todayYMD()));
    const today = todayYMD();
    const isCurrent = cursor.year === today.year && cursor.month === today.month;
    const range = {
        from: ymdToISO({ year: cursor.year, month: cursor.month, day: 1 }),
        to: ymdToISO({ year: cursor.year, month: cursor.month, day: lastDayOfMonth(cursor.year, cursor.month) }),
    };

    const prev = () => {
        setCursor((current) => {
            const month = current.month - 1;
            return month < 1 ? { year: current.year - 1, month: 12, day: 1 } : { ...current, month };
        });
    };

    const next = () => {
        setCursor((current) => {
            const month = current.month + 1;
            return month > 12 ? { year: current.year + 1, month: 1, day: 1 } : { ...current, month };
        });
    };

    const reset = () => setCursor(firstOfMonth(todayYMD()));

    return { cursor, range, prev, next, reset, isCurrent };
}
