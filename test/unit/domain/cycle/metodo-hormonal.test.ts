import { describe, expect, it } from "@jest/globals";

import { deriveCycles } from "@/domain/cycle/deriveCycles";
import { fertileWindow } from "@/domain/cycle/fertileWindow";
import { predictNextCycle } from "@/domain/cycle/predictNextCycle";
import type { CheckinFact } from "@/domain/cycle/types/CheckinFact";
import type { PeriodRunFact } from "@/domain/cycle/types/PeriodRunFact";
import type { ReproductiveIntentFact } from "@/domain/cycle/types/ReproductiveIntentFact";

const intent: ReproductiveIntentFact = {
    effectiveFrom: "2026-01-01",
    effectiveTo: null,
    reproductiveMode: "tracking_only",
    contraceptionMethod: "pill",
    breastfeeding: null,
    declaredCycleLength: 28,
    declaredPeriodLength: 5,
};

const periodRuns: PeriodRunFact[] = [
    { startDate: "2026-01-01", endDate: "2026-01-05", status: "closed" },
    { startDate: "2026-01-29", endDate: "2026-02-02", status: "closed" },
];

// Temperaturas que, sin método hormonal, confirmarían BBT (regla 3-sobre-6):
// prueban que predictNextCycle ni siquiera intenta estimar ovulación en este modo.
const checkinsQueConfirmarianBbt: CheckinFact[] = [
    { localDate: "2026-01-29", basalBodyTempC: 36.3, opkResult: null, cervicalMucus: null },
    { localDate: "2026-01-30", basalBodyTempC: 36.3, opkResult: null, cervicalMucus: null },
    { localDate: "2026-01-31", basalBodyTempC: 36.3, opkResult: null, cervicalMucus: null },
    { localDate: "2026-02-01", basalBodyTempC: 36.3, opkResult: null, cervicalMucus: null },
    { localDate: "2026-02-02", basalBodyTempC: 36.3, opkResult: null, cervicalMucus: null },
    { localDate: "2026-02-03", basalBodyTempC: 36.3, opkResult: null, cervicalMucus: null },
    { localDate: "2026-02-04", basalBodyTempC: 36.7, opkResult: null, cervicalMucus: null },
    { localDate: "2026-02-05", basalBodyTempC: 36.7, opkResult: null, cervicalMucus: null },
    { localDate: "2026-02-06", basalBodyTempC: 36.7, opkResult: null, cervicalMucus: null },
];

describe("Método hormonal: no se predice ovulación", () => {
    it("predictedOvulation y ovulationBasis quedan en null aunque haya evidencia BBT en los check-ins", () => {
        const prediction = predictNextCycle({
            today: "2026-02-26",
            cycles: deriveCycles(periodRuns),
            intent,
            checkinsInOpenCycle: checkinsQueConfirmarianBbt,
            isPaused: false,
            hasPostpartumAnchor: true,
        });

        expect(prediction?.predictedOvulation).toBeNull();
        expect(prediction?.ovulationBasis).toBeNull();
    });
});

describe("Método hormonal: la ventana fértil también se suprime", () => {
    it("fertileWindow explica que el método suprime la ovulación", () => {
        const result = fertileWindow({
            ovulationDate: null,
            mode: "tracking_only",
            contraceptionMethod: "pill",
            breastfeeding: null,
        });

        expect(result).toEqual({ start: null, end: null, suppressed: true, suppressedReason: "hormonal_contraception" });
    });

    it("la precedencia hormonal gana incluso si hay una fecha de ovulación calculada", () => {
        const result = fertileWindow({
            ovulationDate: "2026-02-12",
            mode: "tracking_only",
            contraceptionMethod: "hormonal_iud",
            breastfeeding: null,
        });

        expect(result.suppressed).toBe(true);
        expect(result.suppressedReason).toBe("hormonal_contraception");
    });
});
