import { describe, expect, it } from "@jest/globals";

import { reconcilePeriodState } from "@/domain/period/reconcilePeriodState";
import { shouldMergePeriodRuns } from "@/domain/period/shouldMergePeriodRuns";
import type { PeriodCheckinFact } from "@/domain/period/types/PeriodCheckinFact";
import type { PeriodRunSnapshot } from "@/domain/period/types/PeriodRunSnapshot";

function checkin(overrides: Partial<PeriodCheckinFact> & { localDate: string }): PeriodCheckinFact {
    return { bleedingIntensity: null, periodStatusSignal: null, ...overrides };
}

describe("Reconciliación de periodo: fusión de rachas", () => {
    const closedRun: PeriodRunSnapshot[] = [{ startDate: "2026-01-01", endDate: "2026-01-05", status: "closed" }];

    it("un nuevo inicio a menos de 3 días de un cierre propone fusión, no inicio nuevo", () => {
        const action = reconcilePeriodState(
            {
                periodRuns: closedRun,
                checkins: [checkin({ localDate: "2026-01-07", bleedingIntensity: 3 })],
                declaredPeriodLength: 5,
            },
            "2026-01-07",
        );

        expect(action).toEqual({
            type: "proponer_fusión",
            closedRunEndDate: "2026-01-05",
            newStartDate: "2026-01-07",
            gapDays: 2,
        });
    });

    it("un nuevo inicio a 3 días o más de un cierre propone una racha nueva", () => {
        const action = reconcilePeriodState(
            {
                periodRuns: closedRun,
                checkins: [checkin({ localDate: "2026-01-08", bleedingIntensity: 3 })],
                declaredPeriodLength: 5,
            },
            "2026-01-08",
        );

        expect(action).toEqual({ type: "proponer_inicio", startDate: "2026-01-08", source: "bleeding_inferred" });
    });

    it("shouldMergePeriodRuns es la regla pura reutilizable: 0-2 días fusiona, 3+ no", () => {
        expect(shouldMergePeriodRuns("2026-01-05", "2026-01-05")).toBe(true);
        expect(shouldMergePeriodRuns("2026-01-05", "2026-01-07")).toBe(true);
        expect(shouldMergePeriodRuns("2026-01-05", "2026-01-08")).toBe(false);
    });
});
