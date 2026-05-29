import { Cycle, CycleSnapshot, PhaseKey } from "@/types/cycle.types";
import { DailyLog } from "@/types/records.types";
import { AppSettings } from "@/types/settings.types";

import estimateCycle from "../estimation/estimateCycle";
import { toIsoDate } from "../shared/cycleDate.utils";

/** Genera grilla mensual completa usando estimación por día. */
export default function generateMonthDays(
    target: Date,
    settings: AppSettings | null,
    cycles: Cycle[] = [],
    dailyLogs: DailyLog[] = [],
): {
    iso: string;
    day: number;
    inMonth: boolean;
    phase: PhaseKey;
    phaseSource: CycleSnapshot["source"];
    cycleDay: number;
}[] {
    const first = new Date(target.getFullYear(), target.getMonth(), 1, 12);
    const monthStartWeekday = first.getDay();
    const gridStart = new Date(first);
    gridStart.setDate(first.getDate() - monthStartWeekday);

    return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart);
        date.setDate(gridStart.getDate() + index);
        const iso = toIsoDate(date);
        const estimate = estimateCycle(settings, cycles, dailyLogs, iso);

        return {
            iso,
            day: date.getDate(),
            inMonth: date.getMonth() === target.getMonth(),
            phase: estimate.phase,
            phaseSource: estimate.source,
            cycleDay: estimate.cycleDay,
        };
    });
}
