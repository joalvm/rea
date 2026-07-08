import { describe, expect, it } from "@jest/globals";

import { deriveCycles } from "@/domain/cycle/deriveCycles";
import { predictNextCycle } from "@/domain/cycle/predictNextCycle";
import type { PeriodRunFact } from "@/domain/cycle/types/PeriodRunFact";
import type { ReproductiveIntentFact } from "@/domain/cycle/types/ReproductiveIntentFact";

function periodRun(overrides: Partial<PeriodRunFact> & { startDate: string }): PeriodRunFact {
    return { endDate: null, status: "closed", ...overrides };
}

const intent: ReproductiveIntentFact = {
    effectiveFrom: "2025-12-01",
    effectiveTo: null,
    reproductiveMode: "tracking_only",
    contraceptionMethod: null,
    breastfeeding: null,
    declaredCycleLength: 28,
    declaredPeriodLength: 5,
};

// 3 ciclos regulares de 28 días; el 4to (abierto) debería empezar el 2026-04-23.
const periodRuns: PeriodRunFact[] = [
    periodRun({ startDate: "2026-01-01" }),
    periodRun({ startDate: "2026-01-29" }),
    periodRun({ startDate: "2026-02-26" }),
    periodRun({ startDate: "2026-03-26" }),
];
const cycles = deriveCycles(periodRuns);

describe("Retraso: predictedNextStart nunca se mueve hacia adelante", () => {
    it("el día exacto de la fecha predicha, predictedNextStart es esa fecha", () => {
        const prediction = predictNextCycle({
            today: "2026-04-23",
            cycles,
            intent,
            checkinsInOpenCycle: [],
            isPaused: false,
            hasPostpartumAnchor: true,
        });

        expect(prediction?.predictedNextStart).toBe("2026-04-23");
    });

    it("10 días después de la fecha predicha, predictedNextStart sigue siendo la misma fecha", () => {
        const prediction = predictNextCycle({
            today: "2026-05-03",
            cycles,
            intent,
            checkinsInOpenCycle: [],
            isPaused: false,
            hasPostpartumAnchor: true,
        });

        expect(prediction?.predictedNextStart).toBe("2026-04-23");
    });
});

describe("Retraso: confianza degradada", () => {
    it("marca 'retraso, día N' con confianza forzada a 'low' aunque la historia sea buena", () => {
        const prediction = predictNextCycle({
            today: "2026-05-03",
            cycles,
            intent,
            checkinsInOpenCycle: [],
            isPaused: false,
            hasPostpartumAnchor: true,
        });

        // Con 3 ciclos de 28 días y sigma 0, sin retraso esto sería 'medium' o 'high'.
        expect(prediction?.confidence).toBe("low");
    });

    it("sin retraso (today == predictedNextStart), la confianza no se degrada artificialmente", () => {
        const prediction = predictNextCycle({
            today: "2026-04-23",
            cycles,
            intent,
            checkinsInOpenCycle: [],
            isPaused: false,
            hasPostpartumAnchor: true,
        });

        expect(prediction?.confidence).toBe("medium");
    });
});
