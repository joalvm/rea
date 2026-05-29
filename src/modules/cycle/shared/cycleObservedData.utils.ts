import { Cycle } from "../../../types/cycle.types";
import { DailyLog } from "../../../types/records.types";
import { AppSettings } from "../../../types/settings.types";

import { daysBetween } from "./cycleDate.utils";

/** Representa corrida continua de sangrado observado. */
export interface PeriodRun {
    start: string;
    end: string;
    length: number;
}

/** Decide si log cuenta como día de sangrado observado. */
export function isBleedingDay(log: DailyLog) {
    return log.bleedingLevel !== "none" || log.details?.periodStarted === true || log.details?.periodEnded === true;
}

/** Recolecta fechas con sangrado observado real. */
export function getObservedBleedingDates(dailyLogs: DailyLog[]) {
    return new Set(dailyLogs.filter((log) => isBleedingDay(log)).map((log) => log.date));
}

/** Reconstruye periodos observados consecutivos desde diario. */
export function getObservedPeriodRuns(dailyLogs: DailyLog[]): PeriodRun[] {
    const sorted = [...dailyLogs].sort((left, right) => left.date.localeCompare(right.date));
    const runs: PeriodRun[] = [];
    let currentStart: string | null = null;
    let currentEnd: string | null = null;

    const closeRun = () => {
        if (!currentStart || !currentEnd) {
            return;
        }

        runs.push({
            start: currentStart,
            end: currentEnd,
            length: daysBetween(currentStart, currentEnd) + 1,
        });
        currentStart = null;
        currentEnd = null;
    };

    for (const log of sorted) {
        if (!isBleedingDay(log)) {
            closeRun();
            continue;
        }

        const forcedStart = log.details?.periodStarted === true;
        if (!currentStart || !currentEnd) {
            currentStart = log.date;
            currentEnd = log.date;
        } else {
            const gap = daysBetween(currentEnd, log.date);
            if (forcedStart || gap > 1) {
                closeRun();
                currentStart = log.date;
            }

            currentEnd = log.date;
        }

        if (log.details?.periodEnded) {
            closeRun();
        }
    }

    closeRun();
    return runs;
}

/** Mezcla inicios observados desde settings, ciclos y corridas reales. */
export function getObservedCycleStarts(settings: AppSettings | null, cycles: Cycle[], observedRuns: PeriodRun[]) {
    const cycleStarts = cycles
        .filter((cycle) => cycle.source === "observed" || cycle.predicted === false)
        .map((cycle) => cycle.startDate);

    const fromRuns = observedRuns.map((run) => run.start);
    const seed = settings?.lastPeriodStart ? [settings.lastPeriodStart] : [];
    return uniqueDates([...seed, ...cycleStarts, ...fromRuns]);
}

/** Calcula largos de ciclo válidos a partir de inicios observados. */
export function getObservedCycleLengths(starts: string[]) {
    return starts
        .slice(1)
        .map((startDate, index) => daysBetween(starts[index] ?? startDate, startDate))
        .filter((days) => days >= 18 && days <= 60);
}

/** Busca último valor cronológico no posterior a fecha objetivo. */
export function findLastOnOrBefore(values: string[], targetIso: string) {
    for (let index = values.length - 1; index >= 0; index -= 1) {
        if ((values[index] ?? "") <= targetIso) {
            return values[index] ?? null;
        }
    }

    return null;
}

/** Elige ancla actual desde corrida activa o último inicio observado. */
export function findCurrentAnchorStart(
    observedRuns: PeriodRun[],
    observedStarts: string[],
    settings: AppSettings | null,
    todayIso: string,
) {
    const currentRun = observedRuns.find((run) => run.start <= todayIso && run.end >= todayIso);
    if (currentRun) {
        return currentRun.start;
    }

    return findLastOnOrBefore(observedStarts, todayIso) ?? settings?.lastPeriodStart ?? null;
}

function uniqueDates(values: string[]) {
    return [...new Set(values.filter(Boolean))].sort((left, right) => left.localeCompare(right));
}
