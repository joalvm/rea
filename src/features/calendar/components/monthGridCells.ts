import type { TFunction } from "i18next";

import type { CyclePrediction } from "@/db/schema/cyclePrediction";
import type { DailySummary } from "@/db/schema/dailySummary";
import { addDaysToISO, ymdToISO } from "@/shared/utils/ymd";

import { getMonthGridDayStatus, type MonthGridDayStatus } from "./monthGridStatus";

export type MonthGridCursor = { year: number; month: number };

export type MonthGridCell = {
    date: string;
    day: number;
    isCurrentMonth: boolean;
    isSelected: boolean;
    isToday: boolean;
    status: MonthGridDayStatus;
};

type Params = {
    cursor: MonthGridCursor;
    summaries: DailySummary[];
    selectedDate: string;
    prediction: CyclePrediction | null;
    today: string;
    t: TFunction<"calendar">;
};

const MONTH_CELL_COUNT = 42;

/** Construye el modelo puro de las 42 celdas que una rejilla mensual renderiza. */
export function getMonthGridCells({ cursor, summaries, selectedDate, prediction, today, t }: Params): MonthGridCell[] {
    const firstOfMonth = ymdToISO({ year: cursor.year, month: cursor.month, day: 1 });
    const startDate = addDaysToISO(firstOfMonth, -new Date(cursor.year, cursor.month - 1, 1).getDay());
    const summaryByDate = new Map(summaries.map((summary) => [summary.localDate, summary]));
    const monthPrefix = `${cursor.year}-${String(cursor.month).padStart(2, "0")}`;

    return Array.from({ length: MONTH_CELL_COUNT }, (_, index) => {
        const date = addDaysToISO(startDate, index);

        return {
            date,
            day: Number(date.slice(-2)),
            isCurrentMonth: date.startsWith(monthPrefix),
            isSelected: date === selectedDate,
            isToday: date === today,
            status: getMonthGridDayStatus(summaryByDate.get(date), prediction, date, t),
        };
    });
}
