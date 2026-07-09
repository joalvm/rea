import { describe, expect, it } from "@jest/globals";

import { capitalizeFirst } from "@/shared/utils/capitalizeFirst";
import { startOfDay } from "@/shared/utils/startOfDay";
import { toCalendarDate } from "@/shared/utils/toCalendarDate";

describe("Conversión a fecha de calendario", () => {
    it("ancla una cadena YYYY-MM-DD al mediodía local para evitar saltos de día por zona horaria", () => {
        const date = toCalendarDate("2026-06-25");
        expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([2026, 5, 25, 12]);
    });

    it("devuelve instancias de Date sin cambios (misma referencia)", () => {
        const original = new Date(2026, 0, 1, 8, 30);
        expect(toCalendarDate(original)).toBe(original);
    });

    it("trata números como milisegundos epoch", () => {
        expect(toCalendarDate(0).getTime()).toBe(0);
    });

    it("respeta una hora explícita en una cadena ISO datetime", () => {
        expect(toCalendarDate("2026-06-25T00:00:00Z").getTime()).toBe(Date.UTC(2026, 5, 25));
    });
});

describe("Capitalización de la primera letra", () => {
    it("capitaliza solo la primera letra", () => {
        expect(capitalizeFirst("junio")).toBe("Junio");
    });

    it("deja intacta una cadena vacía", () => {
        expect(capitalizeFirst("")).toBe("");
    });
});

describe("Inicio del día", () => {
    it("pone a cero el componente de hora sin mutar la entrada", () => {
        const input = new Date(2026, 5, 25, 13, 45, 10);
        const result = startOfDay(input);
        expect([result.getHours(), result.getMinutes(), result.getSeconds()]).toEqual([0, 0, 0]);
        expect(input.getHours()).toBe(13);
    });
});
