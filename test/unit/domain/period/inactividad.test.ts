import { describe, expect, it } from "@jest/globals";

import { reconcilePeriodState } from "@/domain/period/reconcilePeriodState";
import type { PeriodCheckinFact } from "@/domain/period/types/PeriodCheckinFact";
import type { PeriodRunSnapshot } from "@/domain/period/types/PeriodRunSnapshot";

function checkin(overrides: Partial<PeriodCheckinFact> & { localDate: string }): PeriodCheckinFact {
    return { bleedingIntensity: null, periodStatusSignal: null, ...overrides };
}

describe("Reconciliación de periodo: prompt de inactividad", () => {
    const openRun: PeriodRunSnapshot[] = [{ startDate: "2026-01-01", endDate: null, status: "open" }];
    const checkins: PeriodCheckinFact[] = [checkin({ localDate: "2026-01-05", bleedingIntensity: 3 })];

    it("no propone cierre antes de declared_period_length + 3 días sin sangrado real", () => {
        const action = reconcilePeriodState(
            { periodRuns: openRun, checkins, declaredPeriodLength: 5 },
            "2026-01-12", // 7 días desde el último sangrado real (umbral: 5 + 3 = 8)
        );

        expect(action).toEqual({ type: "nada" });
    });

    it("propone cierre por inactividad al cumplirse declared_period_length + 3 días", () => {
        const action = reconcilePeriodState(
            { periodRuns: openRun, checkins, declaredPeriodLength: 5 },
            "2026-01-13", // 8 días desde el último sangrado real
        );

        expect(action).toEqual({ type: "proponer_cierre", endDate: "2026-01-05", reason: "inactivity_prompt" });
    });

    it("usa una duración asumida cuando no hay declared_period_length", () => {
        const action = reconcilePeriodState(
            { periodRuns: openRun, checkins, declaredPeriodLength: null },
            "2026-01-14", // 9 días desde el último sangrado real (umbral asumido: 6 + 3 = 9)
        );

        expect(action).toEqual({ type: "proponer_cierre", endDate: "2026-01-05", reason: "inactivity_prompt" });
    });
});
