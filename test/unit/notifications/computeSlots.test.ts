import { describe, expect, it } from "@jest/globals";

import { computeReminderSlots } from "@/modules/notifications/computeSlots";

describe("computeReminderSlots", () => {
    it("reparte slots cada 3 horas dentro de la ventana 09-22", () => {
        expect(computeReminderSlots("09:00", "22:00", 3)).toEqual([
            { hour: 9, minute: 0 },
            { hour: 12, minute: 0 },
            { hour: 15, minute: 0 },
            { hour: 18, minute: 0 },
            { hour: 21, minute: 0 },
        ]);
    });

    it("reparte slots cada 6 horas dentro de la ventana 09-22", () => {
        expect(computeReminderSlots("09:00", "22:00", 6)).toEqual([
            { hour: 9, minute: 0 },
            { hour: 15, minute: 0 },
            { hour: 21, minute: 0 },
        ]);
    });

    it("reparte slots cada 12 horas dentro de la ventana 09-22", () => {
        expect(computeReminderSlots("09:00", "22:00", 12)).toEqual([
            { hour: 9, minute: 0 },
            { hour: 21, minute: 0 },
        ]);
    });

    it("descarta el slot que cae exactamente en windowEnd", () => {
        // Ventana 09-21 con intervalo 6: slot en 21 == end, se descarta.
        expect(computeReminderSlots("09:00", "21:00", 6)).toEqual([
            { hour: 9, minute: 0 },
            { hour: 15, minute: 0 },
        ]);
    });

    it("devuelve vacio si la ventana es invalida (end <= start)", () => {
        expect(computeReminderSlots("22:00", "22:00", 6)).toEqual([]);
        expect(computeReminderSlots("22:00", "09:00", 6)).toEqual([]);
    });

    it("devuelve vacio si los horarios no tienen formato HH:MM", () => {
        expect(computeReminderSlots("mal", "22:00", 6)).toEqual([]);
        expect(computeReminderSlots("09:00", "roto", 6)).toEqual([]);
    });

    it("respeta los minutos del windowStart cuando no es en punto", () => {
        // Ventana 08:30-12:00 con intervalo 3: slots a 08:30 y 11:30.
        expect(computeReminderSlots("08:30", "12:00", 3)).toEqual([
            { hour: 8, minute: 30 },
            { hour: 11, minute: 30 },
        ]);
    });
});
