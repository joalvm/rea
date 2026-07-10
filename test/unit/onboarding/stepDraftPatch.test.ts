import { describe, expect, it } from "@jest/globals";

import { contraceptionSchema } from "@/features/onboarding/contraception/schemas/contraceptionSchema";
import { getRegularitySelection } from "@/features/onboarding/shared/utils/getRegularitySelection";
import { lastPeriodSchema } from "@/features/onboarding/last-period/schemas/lastPeriodSchema";
import { estimateDueDate, estimateLmpFromDueDate } from "@/features/onboarding/pregnancy-setup/utils/estimateDueDate";
import { pregnancySchema } from "@/features/onboarding/pregnancy-setup/schemas/pregnancySchema";
import { addDaysToISO, todayYMD, ymdToISO } from "@/shared/utils/ymd";

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

    it("acepta el ancla por FUM y deriva la FPP mostrada", () => {
        const result = pregnancySchema.safeParse({
            pregnancyDatingBasis: "lmp",
            pregnancyLmp: "2026-02-10",
            pregnancyDueDate: "2026-11-17",
        });

        expect(result.success).toBe(true);

        if (!result.success) {
            throw new Error("se esperaba un paso válido de embarazo anclado por FUM");
        }

        expect(result.data).toEqual({
            pregnancyDatingBasis: "lmp",
            pregnancyLmp: "2026-02-10",
            pregnancyDueDate: "2026-11-17",
        });
    });

    it("acepta el ancla por FPP y deriva la FUM mostrada", () => {
        const result = pregnancySchema.safeParse({
            pregnancyDatingBasis: "due_date",
            pregnancyLmp: "2026-02-10",
            pregnancyDueDate: "2026-11-17",
        });

        expect(result.success).toBe(true);
    });

    it("rechaza una fecha probable de parto igual o anterior a la última regla", () => {
        const result = pregnancySchema.safeParse({
            pregnancyDatingBasis: "lmp",
            pregnancyLmp: "2026-02-10",
            pregnancyDueDate: "2026-02-10",
        });

        expect(result.success).toBe(false);

        if (result.success) {
            throw new Error("se esperaba un paso inválido de embarazo");
        }

        expect(result.error.issues[0]?.message).toBe("dueNotAfterLmp");
    });

    it("estima una fecha probable coherente a partir de la FUM (regla de Naegele)", () => {
        expect(estimateDueDate({ year: 2026, month: 2, day: 10 })).toBe("2026-11-17");
    });

    it("estima la FUM coherente a partir de la FPP (inversa de Naegele)", () => {
        expect(estimateLmpFromDueDate({ year: 2026, month: 11, day: 17 })).toBe("2026-02-10");
    });

    it("rechaza fechas imposibles del calendario", () => {
        const result = pregnancySchema.safeParse({
            pregnancyDatingBasis: "lmp",
            pregnancyLmp: "2026-02-30",
            pregnancyDueDate: "2026-11-17",
        });

        expect(result.success).toBe(false);

        if (result.success) {
            throw new Error("se esperaba una fecha de calendario inválida");
        }

        expect(result.error.issues[0]?.path[0]).toBe("pregnancyLmp");
    });

    it("rechaza una FUM declarada en el futuro", () => {
        const future = addDaysToISO(ymdToISO(todayYMD()), 5);
        const result = pregnancySchema.safeParse({
            pregnancyDatingBasis: "lmp",
            pregnancyLmp: future,
            pregnancyDueDate: addDaysToISO(future, 280),
        });

        expect(result.success).toBe(false);

        if (result.success) {
            throw new Error("se esperaba rechazar una FUM futura");
        }

        expect(result.error.issues[0]?.message).toBe("lmpInFuture");
    });

    it("rechaza una FUM demasiado antigua para ser el ancla declarada", () => {
        const tooOld = addDaysToISO(ymdToISO(todayYMD()), -301);
        const result = pregnancySchema.safeParse({
            pregnancyDatingBasis: "lmp",
            pregnancyLmp: tooOld,
            pregnancyDueDate: addDaysToISO(tooOld, 280),
        });

        expect(result.success).toBe(false);

        if (result.success) {
            throw new Error("se esperaba rechazar una FUM demasiado antigua");
        }

        expect(result.error.issues[0]?.message).toBe("lmpTooOld");
    });

    it("rechaza una FPP declarada en el pasado", () => {
        const past = addDaysToISO(ymdToISO(todayYMD()), -5);
        const result = pregnancySchema.safeParse({
            pregnancyDatingBasis: "due_date",
            pregnancyLmp: addDaysToISO(past, -280),
            pregnancyDueDate: past,
        });

        expect(result.success).toBe(false);

        if (result.success) {
            throw new Error("se esperaba rechazar una FPP en el pasado");
        }

        expect(result.error.issues[0]?.message).toBe("dueDateInPast");
    });

    it("rechaza una FPP demasiado lejana para ser el ancla declarada", () => {
        const tooFar = addDaysToISO(ymdToISO(todayYMD()), 301);
        const result = pregnancySchema.safeParse({
            pregnancyDatingBasis: "due_date",
            pregnancyLmp: addDaysToISO(tooFar, -280),
            pregnancyDueDate: tooFar,
        });

        expect(result.success).toBe(false);

        if (result.success) {
            throw new Error("se esperaba rechazar una FPP demasiado lejana");
        }

        expect(result.error.issues[0]?.message).toBe("dueDateTooFar");
    });
});

describe("Anticoncepción del onboarding", () => {
    it("acepta un método declarado", () => {
        const result = contraceptionSchema.safeParse({ contraceptionMethod: "pill" });

        expect(result.success).toBe(true);
    });

    it("acepta NULL como 'prefiero no decirlo', de primera clase", () => {
        const result = contraceptionSchema.safeParse({ contraceptionMethod: null });

        expect(result.success).toBe(true);
    });

    it("rechaza un método fuera del catálogo reconocido", () => {
        const result = contraceptionSchema.safeParse({ contraceptionMethod: "witchcraft" });

        expect(result.success).toBe(false);
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
