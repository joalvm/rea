import { describe, expect, it } from "@jest/globals";

import { reconcilePeriodState } from "@/domain/period/reconcilePeriodState";
import type { PeriodCheckinFact } from "@/domain/period/types/PeriodCheckinFact";
import type { PeriodRunSnapshot } from "@/domain/period/types/PeriodRunSnapshot";

function checkin(overrides: Partial<PeriodCheckinFact> & { localDate: string }): PeriodCheckinFact {
    return { bleedingIntensity: null, periodStatusSignal: null, ...overrides };
}

describe("Reconciliación de periodo: spotting de cola no alarga la regla", () => {
    it("el cierre por señal 'terminó' usa el último día de sangrado ≥2, no el día de spotting", () => {
        const openRun: PeriodRunSnapshot[] = [{ startDate: "2026-01-01", endDate: null, status: "open" }];
        const checkins: PeriodCheckinFact[] = [
            checkin({ localDate: "2026-01-01", bleedingIntensity: 3 }),
            checkin({ localDate: "2026-01-02", bleedingIntensity: 3 }),
            checkin({ localDate: "2026-01-03", bleedingIntensity: 3 }),
            checkin({ localDate: "2026-01-04", bleedingIntensity: 3 }),
            checkin({ localDate: "2026-01-05", bleedingIntensity: 1 }), // spotting de cola
            checkin({ localDate: "2026-01-06", bleedingIntensity: 1, periodStatusSignal: "ended" }),
        ];

        const action = reconcilePeriodState({ periodRuns: openRun, checkins, declaredPeriodLength: 5 }, "2026-01-06");

        expect(action).toEqual({ type: "proponer_cierre", endDate: "2026-01-04", reason: "signal_ended" });
    });

    it("el cierre por inactividad tampoco cuenta el spotting de cola para el conteo de días", () => {
        const openRun: PeriodRunSnapshot[] = [{ startDate: "2026-01-01", endDate: null, status: "open" }];
        const checkins: PeriodCheckinFact[] = [
            checkin({ localDate: "2026-01-04", bleedingIntensity: 3 }),
            checkin({ localDate: "2026-01-05", bleedingIntensity: 1 }),
            checkin({ localDate: "2026-01-06", bleedingIntensity: 1 }),
        ];

        // Umbral 5+3=8 días desde el último sangrado real (01-04), no desde el spotting (01-06).
        const tooSoon = reconcilePeriodState({ periodRuns: openRun, checkins, declaredPeriodLength: 5 }, "2026-01-11");
        expect(tooSoon).toEqual({ type: "nada" });

        const dueDate = reconcilePeriodState({ periodRuns: openRun, checkins, declaredPeriodLength: 5 }, "2026-01-12");
        expect(dueDate).toEqual({ type: "proponer_cierre", endDate: "2026-01-04", reason: "inactivity_prompt" });
    });
});
