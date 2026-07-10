import { describe, expect, it } from "@jest/globals";

import { reconcilePeriodState } from "@/domain/period/reconcilePeriodState";
import type { PeriodCheckinFact } from "@/domain/period/types/PeriodCheckinFact";
import type { PeriodRunSnapshot } from "@/domain/period/types/PeriodRunSnapshot";

function checkin(overrides: Partial<PeriodCheckinFact> & { localDate: string }): PeriodCheckinFact {
    return { bleedingIntensity: null, periodStatusSignal: null, ...overrides };
}

describe("Reconciliación de periodo: inferencia de inicio", () => {
    it("sangrado ≥2 sin racha abierta propone inicio con source bleeding_inferred", () => {
        const action = reconcilePeriodState(
            {
                periodRuns: [],
                checkins: [checkin({ localDate: "2026-02-10", bleedingIntensity: 2 })],
                declaredPeriodLength: 5,
            },
            "2026-02-10",
        );

        expect(action).toEqual({ type: "proponer_inicio", startDate: "2026-02-10", source: "bleeding_inferred" });
    });

    it("spotting (intensidad 1) nunca infiere un inicio", () => {
        const action = reconcilePeriodState(
            {
                periodRuns: [],
                checkins: [checkin({ localDate: "2026-02-10", bleedingIntensity: 1 })],
                declaredPeriodLength: 5,
            },
            "2026-02-10",
        );

        expect(action).toEqual({ type: "nada" });
    });

    it("un día ya cubierto por una racha existente no vuelve a proponerse", () => {
        const periodRuns: PeriodRunSnapshot[] = [{ startDate: "2026-02-08", endDate: "2026-02-12", status: "closed" }];
        const action = reconcilePeriodState(
            {
                periodRuns,
                checkins: [checkin({ localDate: "2026-02-10", bleedingIntensity: 3 })],
                declaredPeriodLength: 5,
            },
            "2026-02-10",
        );

        expect(action).toEqual({ type: "nada" });
    });

    it("propone el primer día no cubierto cuando hay varios días de sangrado suelto", () => {
        const action = reconcilePeriodState(
            {
                periodRuns: [],
                checkins: [
                    checkin({ localDate: "2026-02-11", bleedingIntensity: 3 }),
                    checkin({ localDate: "2026-02-10", bleedingIntensity: 2 }),
                ],
                declaredPeriodLength: 5,
            },
            "2026-02-11",
        );

        expect(action).toMatchObject({ type: "proponer_inicio", startDate: "2026-02-10" });
    });
});
