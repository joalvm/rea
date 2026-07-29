import type { Checkin } from "@/db/schema/checkin";
import type { CycleRecord } from "@/db/schema/cycleRecord";
import type { DailySummary } from "@/db/schema/dailySummary";

export type CycleSeriesPoint = {
    cycleDay: number;
    mood: number | null;
    energy: number | null;
    pain: number | null;
};

export type CycleStats = {
    validCycleCount: number;
    averageCycleLength: number | null;
    averagePeriodLength: number | null;
    accuracy: { meanAbsoluteError: number; sampleSize: number } | null;
    series: CycleSeriesPoint[];
    checkinCount: number;
    missingCyclesForHistory: number;
};

const MIN_CYCLES_FOR_HISTORY = 3;

export function computeCycleStats(input: {
    cycles: CycleRecord[];
    summaries: DailySummary[];
    checkins: Checkin[];
}): CycleStats {
    const validCycles = input.cycles.filter((cycle) => cycle.isValid);
    const predictionErrors = validCycles
        .map((cycle) => cycle.predictionErrorDays)
        .filter((error): error is number => error !== null);

    const groupedSeries = new Map<number, { mood: number[]; energy: number[]; pain: number[] }>();
    for (const summary of input.summaries) {
        if (summary.cycleDay === null) {
            continue;
        }
        const point = groupedSeries.get(summary.cycleDay) ?? { mood: [], energy: [], pain: [] };
        if (summary.avgMood !== null) point.mood.push(summary.avgMood);
        if (summary.avgEnergy !== null) point.energy.push(summary.avgEnergy);
        if (summary.maxPain !== null) point.pain.push(summary.maxPain);
        groupedSeries.set(summary.cycleDay, point);
    }

    return {
        validCycleCount: validCycles.length,
        averageCycleLength: average(validCycles.map((cycle) => cycle.cycleLength)),
        averagePeriodLength: average(
            validCycles.map((cycle) => cycle.periodLength).filter((value): value is number => value !== null),
        ),
        accuracy:
            predictionErrors.length > 0
                ? {
                      meanAbsoluteError: average(predictionErrors.map(Math.abs)) ?? 0,
                      sampleSize: predictionErrors.length,
                  }
                : null,
        series: [...groupedSeries.entries()]
            .sort(([left], [right]) => left - right)
            .map(([cycleDay, point]) => ({
                cycleDay,
                mood: average(point.mood),
                energy: average(point.energy),
                pain: average(point.pain),
            })),
        checkinCount: input.checkins.length,
        missingCyclesForHistory: Math.max(0, MIN_CYCLES_FOR_HISTORY - validCycles.length),
    };
}

function average(values: number[]): number | null {
    return values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : null;
}
