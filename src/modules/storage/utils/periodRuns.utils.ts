import { DailyLog } from "../../../types/records.types";

/** Reconstruye corridas observadas de sangrado desde logs diarios. */
export function buildObservedPeriodRuns(dailyLogs: DailyLog[]) {
    const sorted = [...dailyLogs].sort((left, right) => left.date.localeCompare(right.date));
    const runs: { start: string; end: string }[] = [];
    let currentStart: string | null = null;
    let currentEnd: string | null = null;

    const closeRun = () => {
        if (!currentStart || !currentEnd) {
            return;
        }

        runs.push({ start: currentStart, end: currentEnd });
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
            const previous = new Date(`${currentEnd}T12:00:00.000Z`).getTime();
            const current = new Date(`${log.date}T12:00:00.000Z`).getTime();
            const gap = Math.round((current - previous) / 86400000);

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

/** Decide si log cuenta como día de sangrado observado. */
export function isBleedingDay(log: DailyLog) {
    return log.bleedingLevel !== "none" || log.details?.periodStarted === true || log.details?.periodEnded === true;
}
