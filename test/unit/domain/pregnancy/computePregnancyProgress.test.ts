import { describe, expect, it } from "@jest/globals";

import { computePregnancyProgress } from "@/domain/pregnancy/computePregnancyProgress";

describe("Progreso del embarazo", () => {
    it("calcula semana, trimestre y días restantes desde la FUM", () => {
        expect(computePregnancyProgress("2026-01-01", "2026-04-02")).toEqual({
            week: 14,
            day: 0,
            trimester: 2,
            daysRemaining: 189,
            isBeyondDueDate: false,
        });
    });

    it("marca fechas posteriores a la FPP sin inventar semanas negativas", () => {
        const progress = computePregnancyProgress("2025-01-01", "2026-01-20");

        expect(progress.week).toBeGreaterThan(52);
        expect(progress.daysRemaining).toBe(0);
        expect(progress.isBeyondDueDate).toBe(true);
    });
});
