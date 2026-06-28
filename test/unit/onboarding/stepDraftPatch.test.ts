import { describe, expect, it } from "@jest/globals";

import { buildLastPeriodDraftPatch } from "@/features/onboarding/shared/utils/buildLastPeriodDraftPatch";
import { buildPregnancyDraftPatch } from "@/features/onboarding/shared/utils/buildPregnancyDraftPatch";
import { getRegularitySelection } from "@/features/onboarding/shared/utils/getRegularitySelection";

describe("Parches de pasos del onboarding", () => {
    it("sincroniza el último periodo visible aunque la usuaria no toque la rueda", () => {
        const result = buildLastPeriodDraftPatch(
            { year: 2026, month: 5, day: 1 },
            { year: 2026, month: 5, day: 5 },
            false,
        );

        expect(result).toEqual({
            isValid: true,
            patch: {
                lastPeriodStart: "2026-05-01",
                lastPeriodEnd: "2026-05-05",
            },
        });
    });

    it("rechaza un último periodo cuyo fin queda antes del inicio", () => {
        expect(
            buildLastPeriodDraftPatch({ year: 2026, month: 5, day: 10 }, { year: 2026, month: 5, day: 5 }, false),
        ).toEqual({ isValid: false });
    });

    it("limpia la fecha de fin del periodo cuando la usuaria marca que sigue en curso", () => {
        expect(
            buildLastPeriodDraftPatch({ year: 2026, month: 5, day: 10 }, { year: 2026, month: 5, day: 12 }, true),
        ).toEqual({
            isValid: true,
            patch: {
                lastPeriodStart: "2026-05-10",
                lastPeriodEnd: null,
            },
        });
    });

    it("sincroniza la FUM visible del embarazo aunque no haya interacción", () => {
        const result = buildPregnancyDraftPatch(
            { year: 2026, month: 2, day: 10 },
            { year: 2026, month: 11, day: 17 },
            false,
        );

        expect(result).toEqual({
            isValid: true,
            patch: {
                pregnancyLmp: "2026-02-10",
                pregnancyDueDate: null,
            },
        });
    });

    it("rechaza una fecha probable de parto igual o anterior a la última regla", () => {
        expect(
            buildPregnancyDraftPatch({ year: 2026, month: 2, day: 10 }, { year: 2026, month: 2, day: 10 }, true),
        ).toEqual({ isValid: false });
    });
});

describe("Selección de regularidad", () => {
    it("preserva la opción unsure al volver atrás", () => {
        expect(
            getRegularitySelection({
                regularity: "irregular",
                regularitySelection: "unsure",
            }),
        ).toBe("unsure");
    });

    it("cae al valor persistido cuando todavía no hay selección explícita", () => {
        expect(
            getRegularitySelection({
                regularity: "variable",
                regularitySelection: null,
            }),
        ).toBe("variable");
    });
});
