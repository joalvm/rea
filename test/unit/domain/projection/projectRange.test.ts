import { describe, expect, it } from "@jest/globals";

import { projectRange } from "@/domain/projection/projectRange";
import type { CheckinProjectionFact } from "@/domain/projection/types/CheckinProjectionFact";
import type { CycleWindow } from "@/domain/cycle/types/CycleWindow";
import type { CyclePredictionResult } from "@/domain/cycle/types/CyclePredictionResult";
import type { ReproductiveIntentFact } from "@/domain/cycle/types/ReproductiveIntentFact";

function checkin(overrides: Partial<CheckinProjectionFact> = {}): CheckinProjectionFact {
    return {
        localDate: "2026-01-01",
        basalBodyTempC: null,
        opkResult: null,
        cervicalMucus: null,
        bleedingIntensity: null,
        periodStatusSignal: null,
        mood: null,
        energy: null,
        stressLevel: null,
        painIntensity: null,
        excludedFromSummary: false,
        symptoms: [],
        medications: [],
        ...overrides,
    };
}

function intent(overrides: Partial<ReproductiveIntentFact> & { effectiveFrom: string }): ReproductiveIntentFact {
    return {
        effectiveTo: null,
        reproductiveMode: "tracking_only",
        contraceptionMethod: null,
        breastfeeding: null,
        declaredCycleLength: 28,
        declaredPeriodLength: 5,
        ...overrides,
    };
}

const baseArgs = {
    profileId: "profile-1",
    updatedAt: "2026-01-20T08:00:00Z",
    cycles: [] as CycleWindow[],
    prediction: null as CyclePredictionResult,
    checkinsByDate: {} as Record<string, CheckinProjectionFact[]>,
    intentHistory: [intent({ effectiveFrom: "2025-01-01" })],
    pregnancyEpisodes: [],
    intercourseDates: new Set<string>(),
};

describe("projectRange: idempotencia", () => {
    it("dos corridas con el mismo input producen arrays idénticos", () => {
        const cycle: CycleWindow = {
            startDate: "2026-01-01",
            endDate: null,
            periodLength: 5,
            cycleLength: null,
            isValid: true,
            excludedReason: null,
            ovulationDate: null,
            ovulationBasis: null,
            lutealLength: null,
        };
        const prediction: CyclePredictionResult = {
            predictedNextStart: "2026-01-29",
            cycleLengthUsed: 28,
            lutealPhaseUsed: 14,
            predictedPeriodLength: 5,
            predictedOvulation: "2026-01-15",
            ovulationBasis: "calendar",
            fertileWindow: { start: "2026-01-10", end: "2026-01-16", suppressed: false, suppressedReason: null },
            confidence: "medium",
            basedOnDeclaredPrior: false,
        };
        const input = {
            ...baseArgs,
            from: "2026-01-01",
            to: "2026-01-20",
            cycles: [cycle],
            prediction,
            checkinsByDate: {
                "2026-01-03": [checkin({ localDate: "2026-01-03", mood: 4, symptoms: [{ symptomKey: "cramps", intensity: 3, uiPriority: 1 }] })],
            },
        };

        expect(projectRange(input)).toEqual(projectRange(input));
    });
});

describe("projectRange: día de cambio de modo", () => {
    it("isPregnancyDay refleja el modo vigente en cada fecha, incluso a mitad de rango", () => {
        const input = {
            ...baseArgs,
            from: "2026-01-10",
            to: "2026-01-20",
            intentHistory: [
                intent({ effectiveFrom: "2025-12-01", effectiveTo: "2026-01-14", reproductiveMode: "tracking_only" }),
                intent({ effectiveFrom: "2026-01-15", effectiveTo: null, reproductiveMode: "pregnancy_tracking" }),
            ],
        };

        const rows = projectRange(input);
        const byDate = new Map(rows.map((row) => [row.localDate, row]));

        expect(byDate.get("2026-01-14")?.isPregnancyDay).toBe(false);
        expect(byDate.get("2026-01-15")?.isPregnancyDay).toBe(true);
        expect(byDate.get("2026-01-20")?.isPregnancyDay).toBe(true);
    });
});

describe("projectRange: día de inicio inferido", () => {
    it("bleeding + señal de periodo sin racha registrada infiere menstruación", () => {
        const input = {
            ...baseArgs,
            from: "2026-02-01",
            to: "2026-02-01",
            checkinsByDate: {
                "2026-02-01": [checkin({ localDate: "2026-02-01", bleedingIntensity: 2, periodStatusSignal: "started" })],
            },
        };

        const [row] = projectRange(input);
        expect(row).toMatchObject({ isMenstruationDay: true, menstruationBasis: "inferred_bleeding", isSpottingDay: false });
    });

    it("bleeding sin señal de periodo y sin racha registrada es spotting, no menstruación", () => {
        const input = {
            ...baseArgs,
            from: "2026-02-01",
            to: "2026-02-01",
            checkinsByDate: {
                "2026-02-01": [checkin({ localDate: "2026-02-01", bleedingIntensity: 1 })],
            },
        };

        const [row] = projectRange(input);
        expect(row).toMatchObject({ isMenstruationDay: false, menstruationBasis: "none", isSpottingDay: true });
    });
});

describe("projectRange: agregación de check-ins", () => {
    it("checkinCount cuenta todos los check-ins del día, incluso los excluidos del resumen", () => {
        const input = {
            ...baseArgs,
            from: "2026-01-05",
            to: "2026-01-05",
            checkinsByDate: {
                "2026-01-05": [
                    checkin({ localDate: "2026-01-05", mood: 3 }),
                    checkin({ localDate: "2026-01-05", mood: 5, excludedFromSummary: true }),
                ],
            },
        };

        const [row] = projectRange(input);
        expect(row?.checkinCount).toBe(2);
        expect(row?.avgMood).toBe(3);
    });

    it("topSymptomKey desempata por mayor intensidad, luego menor uiPriority, luego symptomKey", () => {
        const input = {
            ...baseArgs,
            from: "2026-01-05",
            to: "2026-01-05",
            checkinsByDate: {
                "2026-01-05": [
                    checkin({
                        localDate: "2026-01-05",
                        symptoms: [
                            { symptomKey: "bloating", intensity: 3, uiPriority: 5 },
                            { symptomKey: "cramps", intensity: 3, uiPriority: 2 },
                            { symptomKey: "headache", intensity: 2, uiPriority: 1 },
                        ],
                    }),
                ],
            },
        };

        const [row] = projectRange(input);
        expect(row?.maxSymptomIntensity).toBe(3);
        expect(row?.topSymptomKey).toBe("cramps");
    });

    it("medicationReliefScore promedia solo los alivios reportados de check-ins incluidos", () => {
        const input = {
            ...baseArgs,
            from: "2026-01-05",
            to: "2026-01-05",
            checkinsByDate: {
                "2026-01-05": [
                    checkin({ localDate: "2026-01-05", medications: [{ relief: 2 }, { relief: null }] }),
                    checkin({ localDate: "2026-01-05", medications: [{ relief: 0 }], excludedFromSummary: true }),
                ],
            },
        };

        const [row] = projectRange(input);
        expect(row?.medicationReliefScore).toBe(2);
        expect(row?.hadMedication).toBe(true);
    });
});

describe("projectRange: precedencia de fase estimada", () => {
    const cycle: CycleWindow = {
        startDate: "2026-01-01",
        endDate: null,
        periodLength: 5,
        cycleLength: null,
        isValid: true,
        excludedReason: null,
        ovulationDate: null,
        ovulationBasis: null,
        lutealLength: null,
    };
    const prediction: CyclePredictionResult = {
        predictedNextStart: "2026-01-29",
        cycleLengthUsed: 28,
        lutealPhaseUsed: 14,
        predictedPeriodLength: 5,
        predictedOvulation: "2026-01-15",
        ovulationBasis: "bbt",
        fertileWindow: { start: "2026-01-10", end: "2026-01-16", suppressed: false, suppressedReason: null },
        confidence: "high",
        basedOnDeclaredPrior: false,
    };

    it("menstrual gana sobre ventana fértil aunque la fecha caiga dentro de ambas", () => {
        const input = { ...baseArgs, from: "2026-01-02", to: "2026-01-02", cycles: [cycle], prediction };
        const [row] = projectRange(input);
        expect(row?.estimatedPhase).toBe("menstrual");
    });

    it("ovulación exacta gana sobre ventana fértil", () => {
        const input = { ...baseArgs, from: "2026-01-15", to: "2026-01-15", cycles: [cycle], prediction };
        const [row] = projectRange(input);
        expect(row?.estimatedPhase).toBe("estimated_ovulation");
        expect(row?.ovulationConfirmed).toBe(true);
    });

    it("un día fuera de la ventana fértil se marca folicular o lútea según su posición respecto a la ovulación", () => {
        const beforeOvulation = projectRange({ ...baseArgs, from: "2026-01-08", to: "2026-01-08", cycles: [cycle], prediction })[0];
        const afterOvulation = projectRange({ ...baseArgs, from: "2026-01-20", to: "2026-01-20", cycles: [cycle], prediction })[0];

        expect(beforeOvulation?.estimatedPhase).toBe("follicular");
        expect(afterOvulation?.estimatedPhase).toBe("luteal");
    });

    it("ovulationConfirmed es false cuando la única base es calendario (supuesto, no evidencia)", () => {
        const calendarPrediction: CyclePredictionResult = { ...prediction, ovulationBasis: "calendar" };
        const input = { ...baseArgs, from: "2026-01-15", to: "2026-01-15", cycles: [cycle], prediction: calendarPrediction };
        const [row] = projectRange(input);
        expect(row?.ovulationConfirmed).toBe(false);
    });

    it("cycleDay cuenta los días desde el inicio del ciclo, empezando en 1", () => {
        const input = { ...baseArgs, from: "2026-01-05", to: "2026-01-05", cycles: [cycle], prediction };
        const [row] = projectRange(input);
        expect(row?.cycleDay).toBe(5);
    });
});
