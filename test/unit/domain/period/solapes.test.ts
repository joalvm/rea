import { describe, expect, it } from "@jest/globals";

import { validatePeriodRunOverlap } from "@/domain/period/validatePeriodRunOverlap";
import type { PeriodRunSnapshot } from "@/domain/period/types/PeriodRunSnapshot";

describe("Validación de solapes entre rachas", () => {
    it("detecta solape con una racha cerrada vecina", () => {
        const existingRuns: PeriodRunSnapshot[] = [
            { startDate: "2026-01-01", endDate: "2026-01-05", status: "closed" },
        ];

        const result = validatePeriodRunOverlap(existingRuns, { startDate: "2026-01-03", endDate: "2026-01-04" });

        expect(result).toEqual({ hasOverlap: true, conflictingRun: existingRuns[0] });
    });

    it("no hay solape cuando el candidato cae entre dos rachas", () => {
        const existingRuns: PeriodRunSnapshot[] = [
            { startDate: "2026-01-01", endDate: "2026-01-05", status: "closed" },
            { startDate: "2026-02-01", endDate: null, status: "open" },
        ];

        const result = validatePeriodRunOverlap(existingRuns, { startDate: "2026-01-10", endDate: "2026-01-15" });

        expect(result).toEqual({ hasOverlap: false, conflictingRun: null });
    });

    it("una racha abierta se trata como vigente hasta hoy y más allá", () => {
        const existingRuns: PeriodRunSnapshot[] = [{ startDate: "2026-02-01", endDate: null, status: "open" }];

        const result = validatePeriodRunOverlap(existingRuns, { startDate: "2026-02-20", endDate: null });

        expect(result.hasOverlap).toBe(true);
    });

    it("una racha excluded no bloquea: el motor la ignora, el calendario real también", () => {
        const existingRuns: PeriodRunSnapshot[] = [
            { startDate: "2026-01-01", endDate: "2026-01-05", status: "excluded" },
        ];

        const result = validatePeriodRunOverlap(existingRuns, { startDate: "2026-01-02", endDate: "2026-01-03" });

        expect(result).toEqual({ hasOverlap: false, conflictingRun: null });
    });
});
