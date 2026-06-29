import { describe, expect, it } from "@jest/globals";

import { getRegularitySelection } from "@/features/onboarding/shared/utils/getRegularitySelection";
import { lastPeriodSchema } from "@/features/onboarding/last-period/schemas/lastPeriodSchema";
import { estimateDueDate } from "@/features/onboarding/pregnancy-setup/utils/estimateDueDate";
import { pregnancySchema } from "@/features/onboarding/pregnancy-setup/schemas/pregnancySchema";

describe("Parches de pasos del onboarding", () => {
    it("sincroniza el último periodo visible aunque la usuaria no toque la rueda", () => {
        const result = lastPeriodSchema.safeParse({
            lastPeriodEnd: "2026-05-05",
            lastPeriodOngoing: false,
            lastPeriodStart: "2026-05-01",
        });

        expect(result.success).toBe(true);

        if (!result.success) {
            throw new Error("se esperaba un paso válido de último periodo");
        }

        expect(result.data).toEqual({
            lastPeriodEnd: "2026-05-05",
            lastPeriodOngoing: false,
            lastPeriodStart: "2026-05-01",
        });
    });

    it("rechaza un último periodo cuyo fin queda antes del inicio", () => {
        const result = lastPeriodSchema.safeParse({
            lastPeriodEnd: "2026-05-05",
            lastPeriodOngoing: false,
            lastPeriodStart: "2026-05-10",
        });

        expect(result.success).toBe(false);

        if (result.success) {
            throw new Error("se esperaba un paso inválido de último periodo");
        }

        expect(result.error.issues[0]?.message).toBe("endBeforeStart");
    });

    it("limpia la fecha de fin del periodo cuando la usuaria marca que sigue en curso", () => {
        const result = lastPeriodSchema.safeParse({
            lastPeriodEnd: "2026-05-12",
            lastPeriodOngoing: true,
            lastPeriodStart: "2026-05-10",
        });

        expect(result.success).toBe(true);

        if (!result.success) {
            throw new Error("se esperaba un paso válido de último periodo en curso");
        }

        expect(result.data).toEqual({
            lastPeriodEnd: null,
            lastPeriodOngoing: true,
            lastPeriodStart: "2026-05-10",
        });
    });

    it("sincroniza la FUM visible del embarazo aunque no haya interacción", () => {
        const result = pregnancySchema.safeParse({
            pregnancyDueDate: null,
            pregnancyLmp: "2026-02-10",
        });

        expect(result.success).toBe(true);

        if (!result.success) {
            throw new Error("se esperaba un paso válido de embarazo");
        }

        expect(result.data).toEqual({
            pregnancyDueDate: null,
            pregnancyLmp: "2026-02-10",
        });
    });

    it("rechaza una fecha probable de parto igual o anterior a la última regla", () => {
        const result = pregnancySchema.safeParse({
            pregnancyDueDate: "2026-02-10",
            pregnancyLmp: "2026-02-10",
        });

        expect(result.success).toBe(false);

        if (result.success) {
            throw new Error("se esperaba un paso inválido de embarazo");
        }

        expect(result.error.issues[0]?.message).toBe("dueNotAfterLmp");
    });

    it("estima una fecha probable coherente al activar el toggle sin fecha previa", () => {
        expect(estimateDueDate({ year: 2026, month: 2, day: 10 })).toBe("2026-11-17");
    });

    it("rechaza fechas imposibles del calendario", () => {
        const result = pregnancySchema.safeParse({
            pregnancyDueDate: null,
            pregnancyLmp: "2026-02-30",
        });

        expect(result.success).toBe(false);

        if (result.success) {
            throw new Error("se esperaba una fecha de calendario inválida");
        }

        expect(result.error.issues[0]?.path[0]).toBe("pregnancyLmp");
    });
});

describe("Selección de regularidad", () => {
    it("preserva la opción no estoy segura al volver atrás", () => {
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
