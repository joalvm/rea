import { CycleSnapshot } from "@/types/cycle.types";
import { getWeekdayNarrowLabels } from "@/modules/localization/formatters";

import { daysBetween, parseIsoDate, toIsoDate } from "../utils/cycleDate.utils";

/** Construye semana contextual alrededor de fecha objetivo. */
export default function buildWeek(
    todayIso: string,
    cycleDay: number,
    periodLength: number,
    fertileStart: number,
    fertileEnd: number,
    cycleLength: number,
    observedBleedingDates: Set<string>,
    fertilityVisible: boolean,
): CycleSnapshot["week"] {
    const weekdays = getWeekdayNarrowLabels();
    const today = parseIsoDate(todayIso);
    const start = new Date(today);
    start.setDate(today.getDate() - 3);

    return Array.from({ length: 7 }, (_, index): CycleSnapshot["week"][number] => {
        const date = new Date(start);
        date.setDate(start.getDate() + index);
        const iso = toIsoDate(date);
        const dayOffset = daysBetween(todayIso, iso);
        const projectedCycleDay = ((((cycleDay + dayOffset - 1) % cycleLength) + cycleLength) % cycleLength) + 1;
        const isObservedPeriod = observedBleedingDates.has(iso);

        return {
            iso,
            day: date.getDate(),
            weekday: weekdays[date.getDay()] ?? "",
            isToday: iso === todayIso,
            isPeriod: isObservedPeriod || projectedCycleDay <= periodLength,
            periodSource: isObservedPeriod ? "observed" : projectedCycleDay <= periodLength ? "estimated" : "unknown",
            isFertile:
                fertilityVisible &&
                !isObservedPeriod &&
                projectedCycleDay >= fertileStart &&
                projectedCycleDay <= fertileEnd,
        };
    });
}
