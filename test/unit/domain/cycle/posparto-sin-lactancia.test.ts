import { describe, expect, it } from "@jest/globals";

import { deriveCycles } from "@/domain/cycle/deriveCycles";
import { predictNextCycle } from "@/domain/cycle/predictNextCycle";
import type { PeriodRunFact } from "@/domain/cycle/types/PeriodRunFact";
import type { ReproductiveIntentFact } from "@/domain/cycle/types/ReproductiveIntentFact";

const intent: ReproductiveIntentFact = {
    effectiveFrom: "2026-01-01",
    effectiveTo: null,
    reproductiveMode: "tracking_only",
    contraceptionMethod: null,
    breastfeeding: false,
    declaredCycleLength: 28,
    declaredPeriodLength: 5,
};

describe("Embarazo activo: el motor de ciclo se pausa", () => {
    it("predictNextCycle devuelve null cuando isPaused es true, sin importar la historia", () => {
        const periodRuns: PeriodRunFact[] = [
            { startDate: "2026-01-01", endDate: "2026-01-05", status: "closed" },
            { startDate: "2026-01-29", endDate: "2026-02-02", status: "closed" },
        ];

        const prediction = predictNextCycle({
            today: "2026-03-01",
            cycles: deriveCycles(periodRuns),
            intent,
            checkinsInOpenCycle: [],
            isPaused: true,
            hasPostpartumAnchor: true,
        });

        expect(prediction).toBeNull();
    });
});

describe("Posparto sin regla registrada: no hay ancla, no hay predicción", () => {
    it("predictNextCycle devuelve null cuando hasPostpartumAnchor es false", () => {
        const prediction = predictNextCycle({
            today: "2026-03-01",
            cycles: [],
            intent,
            checkinsInOpenCycle: [],
            isPaused: false,
            hasPostpartumAnchor: false,
        });

        expect(prediction).toBeNull();
    });

    it("sigue siendo null aunque existan ciclos previos al embarazo: sin regla desde el cierre, no hay ancla", () => {
        const periodRunsAntesDelEmbarazo: PeriodRunFact[] = [
            { startDate: "2025-06-01", endDate: "2025-06-05", status: "closed" },
            { startDate: "2025-06-29", endDate: "2025-07-03", status: "closed" },
        ];

        const prediction = predictNextCycle({
            today: "2026-03-01",
            cycles: deriveCycles(periodRunsAntesDelEmbarazo),
            intent,
            checkinsInOpenCycle: [],
            isPaused: false,
            hasPostpartumAnchor: false,
        });

        expect(prediction).toBeNull();
    });
});
