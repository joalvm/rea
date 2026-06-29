import { describe, expect, it, jest } from "@jest/globals";

jest.mock("expo-localization", () => ({
    getLocales: () => [{ languageTag: "es-PE", languageCode: "es", regionCode: "PE", currencyCode: "PEN" }],
    getCalendars: () => [{ firstWeekday: 2 }],
}));

import { formatCurrency } from "@/modules/l10n/formatCurrency";
import { formatDate } from "@/modules/l10n/formatDate";
import { formatList } from "@/modules/l10n/formatList";
import { formatNumber } from "@/modules/l10n/formatNumber";
import { formatPercent } from "@/modules/l10n/formatPercent";
import { formatRelativeCalendarDay } from "@/modules/l10n/formatRelativeTime";
import { formatTime } from "@/modules/l10n/formatTime";
import { getMonthLabels } from "@/modules/l10n/getMonthLabels";
import { weekdayLabels } from "@/modules/l10n/weekdayLabels";

describe("Función formatDate", () => {
    it("capitaliza la primera letra de una etiqueta mes-año", () => {
        expect(formatDate("2026-06-25", "monthYear", "es")).toBe("Junio de 2026");
    });

    it("mantiene estable el día calendario sin importar la zona horaria", () => {
        expect(formatDate("2026-06-25", "long", "es")).toContain("25");
    });
});

describe("Funciones formatNumber y formatPercent", () => {
    it("formatea un número incluyendo sus dígitos", () => {
        expect(formatNumber(1500, undefined, "es")).toMatch(/1.?500/);
    });

    it("renderiza un porcentaje a partir de una fracción", () => {
        const result = formatPercent(0.42, 0, "es");
        expect(result).toContain("42");
        expect(result).toContain("%");
    });
});

describe("Función formatCurrency", () => {
    it("formatea un monto con un código ISO 4217 explícito", () => {
        const result = formatCurrency(1234.5, "PEN", "es-PE");
        expect(result).toMatch(/S\/|PEN/);
        expect(result).toContain("234");
    });
});

describe("Función formatTime", () => {
    it("usa el reloj de 24 h cuando el sistema no reporta preferencia de 12 h", () => {
        // getCalendars mock no trae uses24hourClock ⇒ 24 h ⇒ "20:30" (no "8:30 p. m.").
        expect(formatTime(new Date(2026, 5, 25, 20, 30), "short", "es-PE")).toMatch(/20[:.]30/);
    });
});

describe("Función formatList", () => {
    it("une elementos con la conjunción española", () => {
        expect(formatList(["ánimo", "energía", "sueño"], "and", "es")).toBe("ánimo, energía y sueño");
    });
});

describe("Función formatRelativeCalendarDay", () => {
    const base = new Date(2026, 5, 25, 9, 0, 0);

    it("devuelve hoy para el mismo día calendario", () => {
        expect(formatRelativeCalendarDay(new Date(2026, 5, 25, 20, 0, 0), base, "es")).toBe("hoy");
    });

    it("devuelve ayer para el día anterior", () => {
        expect(formatRelativeCalendarDay(new Date(2026, 5, 24), base, "es")).toBe("ayer");
    });

    it("devuelve mañana para el día siguiente", () => {
        expect(formatRelativeCalendarDay(new Date(2026, 5, 26), base, "es")).toBe("mañana");
    });
});

describe("Función weekdayLabels", () => {
    it("devuelve 7 etiquetas ordenadas desde el primer día de semana del dispositivo (lunes)", () => {
        const labels = weekdayLabels("long", "es");
        expect(labels).toHaveLength(7);
        expect(labels[0]).toBe("Lunes");
    });
});

describe("Función getMonthLabels", () => {
    it("devuelve los 12 nombres de mes en español", () => {
        const labels = getMonthLabels("es");

        expect(labels).toHaveLength(12);
        expect(labels[0]).toBe("enero");
        expect(labels[5]).toBe("junio");
        expect(labels[11]).toBe("diciembre");
    });

    it("devuelve los 12 nombres de mes en inglés", () => {
        const labels = getMonthLabels("en");

        expect(labels).toHaveLength(12);
        expect(labels[0]).toBe("January");
        expect(labels[5]).toBe("June");
        expect(labels[11]).toBe("December");
    });
});
