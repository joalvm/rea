import { describe, expect, it } from "@jest/globals";

import { confidence } from "@/domain/cycle/confidence";
import { cycleStats } from "@/domain/cycle/cycleStats";
import { deriveCycles } from "@/domain/cycle/deriveCycles";
import type { PeriodRunFact } from "@/domain/cycle/types/PeriodRunFact";

function periodRun(overrides: Partial<PeriodRunFact> & { startDate: string }): PeriodRunFact {
    return { endDate: null, status: "closed", ...overrides };
}

// Longitudes de ciclo: 24, 35, 21, 52, 26 (la última racha queda abierta).
const irregularStarts = ["2026-01-01", "2026-01-25", "2026-03-01", "2026-03-22", "2026-05-13", "2026-06-08"];

describe("Ciclo irregular: mediana robusta a outliers", () => {
    const cycles = deriveCycles(irregularStarts.map((startDate) => periodRun({ startDate })));
    const stats = cycleStats(cycles);

    it("deriva las 5 longitudes de ciclo esperadas", () => {
        expect(cycles.slice(0, 5).map((cycle) => cycle.cycleLength)).toEqual([24, 35, 21, 52, 26]);
    });

    it("la mediana sobrevive al outlier (52) que distorsionaría la media", () => {
        const mean = [24, 35, 21, 52, 26].reduce((sum, value) => sum + value, 0) / 5;
        expect(stats.cycleLengthMedian).toBe(26);
        expect(stats.cycleLengthMedian).not.toBe(mean);
        expect(mean).toBeCloseTo(31.6);
    });

    it("confianza es 'low' cuando la dispersión (σ) de la ventana es alta", () => {
        expect(stats.cycleLengthSigma).toBeGreaterThan(4);
        expect(
            confidence({ validCycleCount: stats.sampleSize, sigma: stats.cycleLengthSigma, hasOvulationEvidenceLastCycle: false }),
        ).toBe("low");
    });
});

describe("Ciclo irregular: validez de dominio (15-90 días)", () => {
    it("un ciclo fuera de 15-90 días se guarda marcado inválido, no se descarta", () => {
        const periodRuns = [
            periodRun({ startDate: "2026-01-01" }),
            periodRun({ startDate: "2026-01-06" }), // 5 días: fuera de rango, inválido
            periodRun({ startDate: "2026-02-03" }),
        ];
        const cycles = deriveCycles(periodRuns);

        expect(cycles[0]).toMatchObject({ cycleLength: 5, isValid: false, excludedReason: "cycle_length_out_of_range" });
        expect(cycles[1]?.isValid).toBe(true);
    });

    it("un ciclo inválido no entra en la ventana de aprendizaje de cycleStats", () => {
        const periodRuns = [
            periodRun({ startDate: "2026-01-01" }),
            periodRun({ startDate: "2026-01-06" }), // 5 días, inválido
            periodRun({ startDate: "2026-02-03" }), // 28 días, válido
            periodRun({ startDate: "2026-03-03" }), // 28 días, válido
        ];
        const stats = cycleStats(deriveCycles(periodRuns));

        expect(stats.sampleSize).toBe(2);
        expect(stats.cycleLengthMedian).toBe(28);
    });
});

describe("Ciclo irregular: rachas excluidas no cortan el ciclo", () => {
    it("una racha con status 'excluded' no actúa como ancla: el ciclo sigue de largo", () => {
        const periodRuns = [
            periodRun({ startDate: "2026-01-01" }),
            periodRun({ startDate: "2026-01-15", status: "excluded" }), // sangrado excluido, no corta el ciclo
            periodRun({ startDate: "2026-01-29" }),
        ];
        const cycles = deriveCycles(periodRuns);

        expect(cycles).toHaveLength(2);
        expect(cycles[0]).toMatchObject({ startDate: "2026-01-01", endDate: "2026-01-28", cycleLength: 28 });
    });
});
