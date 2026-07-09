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
    breastfeeding: true,
    declaredCycleLength: 30,
    declaredPeriodLength: 5,
};

// Primera regla registrada desde el cierre del episodio de embarazo: re-ancla todo.
const periodRuns: PeriodRunFact[] = [{ startDate: "2026-03-01", endDate: "2026-03-05", status: "closed" }];

describe("Posparto con lactancia: la primera regla cerrada re-ancla la predicción", () => {
    it("predictNextCycle predice a partir de la primera regla posparto (prior declarado, <2 ciclos)", () => {
        const prediction = predictNextCycle({
            today: "2026-03-01",
            cycles: deriveCycles(periodRuns),
            intent,
            checkinsInOpenCycle: [],
            isPaused: false,
            hasPostpartumAnchor: true,
        });

        expect(prediction).not.toBeNull();
        expect(prediction?.predictedNextStart).toBe("2026-03-31");
        expect(prediction?.basedOnDeclaredPrior).toBe(true);
    });
});

describe("Posparto con lactancia: asimetría de supresión", () => {
    it("suprime solo la ventana fértil; la ovulación estimada sigue siendo visible", () => {
        const prediction = predictNextCycle({
            today: "2026-03-01",
            cycles: deriveCycles(periodRuns),
            intent,
            checkinsInOpenCycle: [],
            isPaused: false,
            hasPostpartumAnchor: true,
        });

        expect(prediction?.predictedOvulation).not.toBeNull();
        expect(prediction?.ovulationBasis).toBe("calendar");
        expect(prediction?.fertileWindow).toEqual({
            start: null,
            end: null,
            suppressed: true,
            suppressedReason: "breastfeeding",
        });
    });
});
