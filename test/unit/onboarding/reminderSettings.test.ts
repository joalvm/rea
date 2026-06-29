import { describe, expect, it } from "@jest/globals";

import { getReminderHourIndex } from "@/shared/schemas/reminder/getReminderHourIndex";
import { parseReminderTime } from "@/shared/schemas/reminder/parseReminderTime";
import { reminderSchema } from "@/shared/schemas/reminder/reminderSchema";

describe("Validación de recordatorios del onboarding", () => {
    it("acepta una ventana válida dentro del mismo día", () => {
        const result = reminderSchema.safeParse({
            reminderIntervalHours: 6,
            reminderWindowStart: "09:00",
            reminderWindowEnd: "22:00",
        });

        expect(result.success).toBe(true);
    });

    it("rechaza horas fuera del rango diario", () => {
        expect(parseReminderTime("24:00")).toBeNull();
        expect(parseReminderTime("23:59")?.totalMinutes).toBe(1439);
        expect(parseReminderTime("09:60")).toBeNull();
        expect(parseReminderTime("9:00")).toBeNull();
    });

    it("rechaza ventanas cuya hora final queda antes de la inicial", () => {
        const result = reminderSchema.safeParse({
            reminderIntervalHours: 6,
            reminderWindowStart: "22:00",
            reminderWindowEnd: "09:00",
        });

        expect(result.success).toBe(false);

        if (result.success) {
            throw new Error("se esperaba una configuración de recordatorios inválida");
        }

        expect(result.error.issues[0]?.message).toBe("endBeforeStart");
    });

    it("rechaza intervalos fuera del contrato del onboarding", () => {
        const result = reminderSchema.safeParse({
            reminderIntervalHours: 4,
            reminderWindowStart: "09:00",
            reminderWindowEnd: "22:00",
        });

        expect(result.success).toBe(false);

        if (result.success) {
            throw new Error("se esperaba una configuración de recordatorios inválida");
        }

        expect(result.error.issues[0]?.message).toBe("invalidInterval");
    });

    it("recurre al valor de respaldo cuando el valor persistido no es una hora válida", () => {
        expect(getReminderHourIndex("99:00", "09:00")).toBe(9);
    });
});
