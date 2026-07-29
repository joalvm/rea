import { describe, expect, it } from "@jest/globals";

import { computeCycleStats } from "@/domain/stats/computeCycleStats";

describe("Estadísticas de ciclo", () => {
    it("devuelve promedios y precisión solo con datos observados", () => {
        const stats = computeCycleStats({
            cycles: [
                { cycleLength: 28, periodLength: 5, isValid: true, predictionErrorDays: 2 },
                { cycleLength: 30, periodLength: 4, isValid: true, predictionErrorDays: -1 },
                { cycleLength: 29, periodLength: 5, isValid: true, predictionErrorDays: null },
            ] as never,
            checkins: [{ id: "a" }] as never,
            summaries: [
                { cycleDay: 1, avgMood: 3, avgEnergy: 4, maxPain: 2 },
                { cycleDay: 1, avgMood: 5, avgEnergy: null, maxPain: null },
            ] as never,
        });

        expect(stats.averageCycleLength).toBe(29);
        expect(stats.averagePeriodLength).toBeCloseTo(14 / 3);
        expect(stats.accuracy).toEqual({ meanAbsoluteError: 1.5, sampleSize: 2 });
        expect(stats.series).toEqual([{ cycleDay: 1, mood: 4, energy: 4, pain: 2 }]);
        expect(stats.missingCyclesForHistory).toBe(0);
    });

    it("expone cuántos ciclos faltan para abrir un gate", () => {
        const stats = computeCycleStats({ cycles: [], checkins: [], summaries: [] });

        expect(stats.missingCyclesForHistory).toBe(3);
        expect(stats.accuracy).toBeNull();
    });
});
