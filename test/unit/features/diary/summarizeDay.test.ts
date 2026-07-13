import { describe, expect, it } from "@jest/globals";

import type { CheckinDetail } from "@/features/diary/entry/services/listCheckinsOfDay";
import { summarizeDay } from "@/features/diary/entry/utils/summarizeDay";

function makeDetail(overrides: Partial<CheckinDetail> = {}): CheckinDetail {
    return {
        id: "c-1",
        recordedAt: "2026-07-12T10:00:00Z",
        note: null,
        bleedingIntensity: null,
        mood: null,
        energy: null,
        periodStatusSignal: null,
        excludedFromSummary: 0,
        symptoms: [],
        medications: [],
        ...overrides,
    };
}

describe("summarizeDay", () => {
    it("devuelve nulls y ceros para un array vacío", () => {
        const summary = summarizeDay([]);

        expect(summary).toEqual({
            moodAvg: null,
            energyAvg: null,
            symptomCount: 0,
            medicationCount: 0,
            bleedingMax: null,
        });
    });

    it("calcula promedios de mood y energy redondeando a 1 decimal", () => {
        const summary = summarizeDay([
            makeDetail({ mood: 3, energy: 2 }),
            makeDetail({ mood: 4, energy: 4 }),
        ]);

        // (3+4)/2 = 3.5; (2+4)/2 = 3
        expect(summary.moodAvg).toBe(3.5);
        expect(summary.energyAvg).toBe(3);
    });

    it("ignora los nulls al promediar mood y energy", () => {
        const summary = summarizeDay([
            makeDetail({ mood: 3, energy: null }),
            makeDetail({ mood: null, energy: 5 }),
            makeDetail({ mood: 5, energy: null }),
        ]);

        // mood: (3+5)/2 = 4; energy: solo un valor = 5
        expect(summary.moodAvg).toBe(4);
        expect(summary.energyAvg).toBe(5);
    });

    it("devuelve moodAvg null si ningún check-in tiene mood", () => {
        const summary = summarizeDay([
            makeDetail({ mood: null }),
            makeDetail({ mood: null }),
        ]);

        expect(summary.moodAvg).toBeNull();
    });

    it("bleedingMax es la intensidad máxima del día", () => {
        const summary = summarizeDay([
            makeDetail({ bleedingIntensity: 1 }),
            makeDetail({ bleedingIntensity: 4 }),
            makeDetail({ bleedingIntensity: 2 }),
        ]);

        expect(summary.bleedingMax).toBe(4);
    });

    it("cuenta el total de síntomas y medicamentos", () => {
        const summary = summarizeDay([
            makeDetail({ symptoms: [{ symptomKey: "a", intensity: 1 }, { symptomKey: "b", intensity: 2 }], medications: [{ medicationId: "m1", name: "x", relief: null }] }),
            makeDetail({ symptoms: [{ symptomKey: "c", intensity: 3 }], medications: [] }),
        ]);

        expect(summary.symptomCount).toBe(3);
        expect(summary.medicationCount).toBe(1);
    });
});
