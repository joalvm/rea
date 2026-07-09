import { describe, expect, it } from "@jest/globals";

import { estimateOvulation } from "@/domain/cycle/estimateOvulation";
import type { CheckinFact } from "@/domain/cycle/types/CheckinFact";

function checkin(overrides: Partial<CheckinFact> & { localDate: string }): CheckinFact {
    return { basalBodyTempC: null, opkResult: null, cervicalMucus: null, ...overrides };
}

describe("BBT ruidosa: un pico aislado no confirma ovulación", () => {
    it("una sola temperatura alta seguida de un descenso no confirma (falta la racha de 3)", () => {
        const checkins: CheckinFact[] = [
            checkin({ localDate: "2026-01-01", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-01-02", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-01-03", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-01-04", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-01-05", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-01-06", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-01-07", basalBodyTempC: 36.9 }), // toma tardía aislada, outlier
            checkin({ localDate: "2026-01-08", basalBodyTempC: 36.3 }), // vuelve a la base
            checkin({ localDate: "2026-01-09", basalBodyTempC: 36.3 }),
        ];

        const result = estimateOvulation({
            cycleStartDate: "2026-01-01",
            expectedOrActualNextStartDate: "2026-01-29",
            checkins,
            lutealLength: 14,
        });

        // Sin racha de 3 sostenida, cae con dignidad a la siguiente evidencia (calendario, sin OPK/moco).
        expect(result).toEqual({ ovulationDate: "2026-01-15", ovulationBasis: "calendar" });
    });

    it("un ciclo anovulatorio (sin ninguna evidencia) predice por calendario, jamás inventa ovulación", () => {
        const result = estimateOvulation({
            cycleStartDate: "2026-01-01",
            expectedOrActualNextStartDate: "2026-01-29",
            checkins: [],
            lutealLength: 14,
        });

        expect(result.ovulationBasis).toBe("calendar");
        expect(result.ovulationDate).toBe("2026-01-15");
    });

    it("una racha sostenida de 3 que sí supera el máximo previo confirma BBT normalmente (control)", () => {
        const checkins: CheckinFact[] = [
            checkin({ localDate: "2026-01-01", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-01-02", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-01-03", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-01-04", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-01-05", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-01-06", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-01-07", basalBodyTempC: 36.9 }),
            checkin({ localDate: "2026-01-08", basalBodyTempC: 36.9 }),
            checkin({ localDate: "2026-01-09", basalBodyTempC: 36.9 }),
        ];

        const result = estimateOvulation({
            cycleStartDate: "2026-01-01",
            expectedOrActualNextStartDate: "2026-01-29",
            checkins,
            lutealLength: 14,
        });

        expect(result).toEqual({ ovulationDate: "2026-01-06", ovulationBasis: "bbt" });
    });
});
