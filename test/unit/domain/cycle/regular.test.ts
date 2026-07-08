import { describe, expect, it } from "@jest/globals";

import { confidence } from "@/domain/cycle/confidence";
import { cycleStats } from "@/domain/cycle/cycleStats";
import { deriveCycles } from "@/domain/cycle/deriveCycles";
import { estimateOvulation } from "@/domain/cycle/estimateOvulation";
import { fertileWindow } from "@/domain/cycle/fertileWindow";
import { predictNextCycle } from "@/domain/cycle/predictNextCycle";
import type { CheckinFact } from "@/domain/cycle/types/CheckinFact";
import type { CycleWindow } from "@/domain/cycle/types/CycleWindow";
import type { PeriodRunFact } from "@/domain/cycle/types/PeriodRunFact";
import type { ReproductiveIntentFact } from "@/domain/cycle/types/ReproductiveIntentFact";

function checkin(overrides: Partial<CheckinFact> & { localDate: string }): CheckinFact {
    return { basalBodyTempC: null, opkResult: null, cervicalMucus: null, ...overrides };
}

function periodRun(overrides: Partial<PeriodRunFact> & { startDate: string }): PeriodRunFact {
    return { endDate: null, status: "closed", ...overrides };
}

const baseIntent: ReproductiveIntentFact = {
    effectiveFrom: "2025-12-01",
    effectiveTo: null,
    reproductiveMode: "tracking_only",
    contraceptionMethod: null,
    breastfeeding: null,
    declaredCycleLength: 30,
    declaredPeriodLength: 6,
};

describe("Ciclo regular: derivación de ciclos", () => {
    const periodRuns: PeriodRunFact[] = [
        periodRun({ startDate: "2026-01-01", endDate: "2026-01-05" }),
        periodRun({ startDate: "2026-01-29", endDate: "2026-02-02" }),
        periodRun({ startDate: "2026-02-26", endDate: "2026-03-02" }),
        periodRun({ startDate: "2026-03-26", endDate: "2026-03-30" }),
        periodRun({ startDate: "2026-04-23", endDate: "2026-04-27" }),
    ];
    const cycles = deriveCycles(periodRuns);

    it("un ciclo va del inicio de regla al día anterior al siguiente inicio", () => {
        expect(cycles[0]).toMatchObject({ startDate: "2026-01-01", endDate: "2026-01-28", cycleLength: 28 });
    });

    it("el último ciclo queda abierto (sin siguiente inicio) con endDate y cycleLength en null", () => {
        expect(cycles[4]).toMatchObject({ startDate: "2026-04-23", endDate: null, cycleLength: null });
    });

    it("un ciclo abierto es válido por defecto: no hay nada que invalidar todavía", () => {
        expect(cycles[4]?.isValid).toBe(true);
    });

    it("un ciclo de 28 días (dentro de 15-90) es válido", () => {
        expect(cycles[0]?.isValid).toBe(true);
        expect(cycles[0]?.excludedReason).toBeNull();
    });

    it("la duración del periodo cuenta los días de sangrado de forma inclusiva", () => {
        expect(cycles[0]?.periodLength).toBe(5);
    });
});

describe("Ciclo regular: estadísticas de la ventana de aprendizaje", () => {
    it("calcula la mediana (no la media) de longitud de ciclo y periodo", () => {
        const periodRuns: PeriodRunFact[] = [
            periodRun({ startDate: "2026-01-01", endDate: "2026-01-05" }),
            periodRun({ startDate: "2026-01-29", endDate: "2026-02-02" }),
            periodRun({ startDate: "2026-02-26", endDate: "2026-03-02" }),
            periodRun({ startDate: "2026-03-26", endDate: "2026-03-30" }),
            periodRun({ startDate: "2026-04-23", endDate: "2026-04-27" }),
        ];
        const stats = cycleStats(deriveCycles(periodRuns));

        expect(stats.sampleSize).toBe(4);
        expect(stats.cycleLengthMedian).toBe(28);
        expect(stats.cycleLengthSigma).toBe(0);
        expect(stats.periodLengthMedian).toBe(5);
    });

    it("la ventana de aprendizaje se limita a los últimos 6 ciclos válidos, ignorando los más antiguos", () => {
        const periodRuns: PeriodRunFact[] = [
            periodRun({ startDate: "2026-01-01" }),
            periodRun({ startDate: "2026-01-21" }), // ciclo 1: 20 días (outlier antiguo, fuera de la ventana)
            periodRun({ startDate: "2026-02-18" }), // ciclo 2: 28 días
            periodRun({ startDate: "2026-03-18" }), // ciclo 3: 28 días
            periodRun({ startDate: "2026-04-15" }), // ciclo 4: 28 días
            periodRun({ startDate: "2026-05-13" }), // ciclo 5: 28 días
            periodRun({ startDate: "2026-06-10" }), // ciclo 6: 28 días
            periodRun({ startDate: "2026-07-08" }), // ciclo 7: 28 días
            periodRun({ startDate: "2026-08-05" }), // ciclo 8: abierto
        ];
        const stats = cycleStats(deriveCycles(periodRuns));

        expect(stats.sampleSize).toBe(6);
        // Si la ventana incluyera el ciclo de 20 días, sigma sería > 0.
        expect(stats.cycleLengthSigma).toBe(0);
        expect(stats.cycleLengthMedian).toBe(28);
    });

    it("personaliza la fase lútea (mediana) solo con ciclos con ovulación confirmada por BBT", () => {
        const historicalCycles: CycleWindow[] = [
            { startDate: "2026-01-01", endDate: "2026-01-28", periodLength: 5, cycleLength: 28, isValid: true, excludedReason: null, ovulationDate: "2026-01-15", ovulationBasis: "bbt", lutealLength: 12 },
            { startDate: "2026-01-29", endDate: "2026-02-25", periodLength: 5, cycleLength: 28, isValid: true, excludedReason: null, ovulationDate: "2026-02-12", ovulationBasis: "bbt", lutealLength: 13 },
            { startDate: "2026-02-26", endDate: "2026-03-25", periodLength: 5, cycleLength: 28, isValid: true, excludedReason: null, ovulationDate: "2026-03-11", ovulationBasis: "calendar", lutealLength: 20 },
            { startDate: "2026-03-26", endDate: "2026-04-22", periodLength: 5, cycleLength: 28, isValid: true, excludedReason: null, ovulationDate: "2026-04-09", ovulationBasis: "bbt", lutealLength: 14 },
        ];
        const stats = cycleStats(historicalCycles);

        expect(stats.bbtConfirmedOvulationCount).toBe(3);
        // El ciclo con basis 'calendar' (lútea 20) no entra en la mediana: mediana de [12,13,14] = 13.
        expect(stats.lutealLengthMedian).toBe(13);
    });
});

describe("Ciclo regular: jerarquía de evidencia de ovulación", () => {
    it("BBT confirmada (regla 3-sobre-6) gana sobre cualquier otra evidencia", () => {
        const checkins: CheckinFact[] = [
            checkin({ localDate: "2026-04-23", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-04-24", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-04-25", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-04-26", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-04-27", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-04-28", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-04-29", basalBodyTempC: 36.7 }),
            checkin({ localDate: "2026-04-30", basalBodyTempC: 36.7 }),
            checkin({ localDate: "2026-05-01", basalBodyTempC: 36.7, opkResult: "positive" }),
        ];

        const result = estimateOvulation({
            cycleStartDate: "2026-04-23",
            expectedOrActualNextStartDate: "2026-05-21",
            checkins,
            lutealLength: 14,
        });

        expect(result).toEqual({ ovulationDate: "2026-04-28", ovulationBasis: "bbt" });
    });

    it("OPK positivo (+1 día) se usa cuando no hay confirmación BBT", () => {
        const checkins: CheckinFact[] = [checkin({ localDate: "2026-01-10", opkResult: "positive" })];

        const result = estimateOvulation({
            cycleStartDate: "2026-01-01",
            expectedOrActualNextStartDate: "2026-01-29",
            checkins,
            lutealLength: 14,
        });

        expect(result).toEqual({ ovulationDate: "2026-01-11", ovulationBasis: "opk" });
    });

    it("moco pico (mismo día) se usa cuando no hay BBT ni OPK", () => {
        const checkins: CheckinFact[] = [
            checkin({ localDate: "2026-01-08", cervicalMucus: 2 }),
            checkin({ localDate: "2026-01-09", cervicalMucus: 4 }),
            checkin({ localDate: "2026-01-10", cervicalMucus: 4 }),
        ];

        const result = estimateOvulation({
            cycleStartDate: "2026-01-01",
            expectedOrActualNextStartDate: "2026-01-29",
            checkins,
            lutealLength: 14,
        });

        expect(result).toEqual({ ovulationDate: "2026-01-10", ovulationBasis: "mucus" });
    });

    it("calendario (próximo inicio − lútea) es el piso: siempre resuelve sin inventar evidencia", () => {
        const result = estimateOvulation({
            cycleStartDate: "2026-01-01",
            expectedOrActualNextStartDate: "2026-01-29",
            checkins: [],
            lutealLength: 14,
        });

        expect(result).toEqual({ ovulationDate: "2026-01-15", ovulationBasis: "calendar" });
    });
});

describe("Ciclo regular: ventana fértil", () => {
    it("es ovulación −5…+1 fuera del modo evitar", () => {
        const result = fertileWindow({
            ovulationDate: "2026-04-28",
            mode: "tracking_only",
            contraceptionMethod: null,
            breastfeeding: null,
        });

        expect(result).toEqual({ start: "2026-04-23", end: "2026-04-29", suppressed: false, suppressedReason: null });
    });
});

describe("Ciclo regular: nivel de confianza", () => {
    it("es 'high' con ≥3 ciclos válidos, σ≤2 y ovulación con evidencia real en el último ciclo", () => {
        expect(confidence({ validCycleCount: 3, sigma: 2, hasOvulationEvidenceLastCycle: true })).toBe("high");
    });

    it("no llega a 'high' si la única evidencia de ovulación es de calendario (supuesto, no evidencia)", () => {
        expect(confidence({ validCycleCount: 5, sigma: 0, hasOvulationEvidenceLastCycle: false })).toBe("medium");
    });
});

describe("Ciclo regular: predicción con historia suficiente", () => {
    it("predice el siguiente inicio y confianza 'high' cuando la historia y la ovulación lo respaldan", () => {
        const periodRuns: PeriodRunFact[] = [
            periodRun({ startDate: "2026-01-01", endDate: "2026-01-05" }),
            periodRun({ startDate: "2026-01-29", endDate: "2026-02-02" }),
            periodRun({ startDate: "2026-02-26", endDate: "2026-03-02" }),
            periodRun({ startDate: "2026-03-26", endDate: "2026-03-30" }),
            periodRun({ startDate: "2026-04-23", endDate: "2026-04-27" }),
        ];
        const checkinsInOpenCycle: CheckinFact[] = [
            checkin({ localDate: "2026-04-23", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-04-24", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-04-25", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-04-26", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-04-27", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-04-28", basalBodyTempC: 36.3 }),
            checkin({ localDate: "2026-04-29", basalBodyTempC: 36.7 }),
            checkin({ localDate: "2026-04-30", basalBodyTempC: 36.7 }),
            checkin({ localDate: "2026-05-01", basalBodyTempC: 36.7 }),
        ];

        const prediction = predictNextCycle({
            today: "2026-05-21",
            cycles: deriveCycles(periodRuns),
            intent: baseIntent,
            checkinsInOpenCycle,
            isPaused: false,
            hasPostpartumAnchor: true,
        });

        expect(prediction).toMatchObject({
            predictedNextStart: "2026-05-21",
            predictedPeriodLength: 5,
            predictedOvulation: "2026-04-28",
            ovulationBasis: "bbt",
            confidence: "high",
            basedOnDeclaredPrior: false,
            fertileWindow: { start: "2026-04-23", end: "2026-04-29", suppressed: false },
        });
    });
});

describe("Ciclo regular: prior declarado", () => {
    it("con menos de 2 ciclos observados, predice con las longitudes declaradas en onboarding", () => {
        const periodRuns: PeriodRunFact[] = [periodRun({ startDate: "2026-01-01", endDate: "2026-01-05" })];

        const prediction = predictNextCycle({
            today: "2026-01-01",
            cycles: deriveCycles(periodRuns),
            intent: baseIntent,
            checkinsInOpenCycle: [],
            isPaused: false,
            hasPostpartumAnchor: true,
        });

        expect(prediction).toMatchObject({
            predictedNextStart: "2026-01-31",
            predictedPeriodLength: 6,
            basedOnDeclaredPrior: true,
            confidence: "low",
        });
    });
});
