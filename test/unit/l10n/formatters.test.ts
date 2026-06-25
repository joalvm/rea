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
import { weekdayLabels } from "@/modules/l10n/weekdayLabels";

describe("formatDate", () => {
    it("capitalizes the leading letter of a month-year label", () => {
        expect(formatDate("2026-06-25", "monthYear", "es")).toBe("Junio de 2026");
    });

    it("keeps the calendar day stable regardless of timezone", () => {
        expect(formatDate("2026-06-25", "long", "es")).toContain("25");
    });
});

describe("formatNumber / formatPercent", () => {
    it("formats a number including its digits", () => {
        expect(formatNumber(1500, undefined, "es")).toMatch(/1.?500/);
    });

    it("renders a percentage from a fraction", () => {
        const result = formatPercent(0.42, 0, "es");
        expect(result).toContain("42");
        expect(result).toContain("%");
    });
});

describe("formatCurrency", () => {
    it("formats an amount with an explicit ISO 4217 code", () => {
        const result = formatCurrency(1234.5, "PEN", "es-PE");
        expect(result).toMatch(/S\/|PEN/);
        expect(result).toContain("234");
    });
});

describe("formatTime", () => {
    it("uses the 24h clock when the system does not report a 12h preference", () => {
        // getCalendars mock no trae uses24hourClock ⇒ 24 h ⇒ "20:30" (no "8:30 p. m.").
        expect(formatTime(new Date(2026, 5, 25, 20, 30), "short", "es-PE")).toMatch(/20[:.]30/);
    });
});

describe("formatList", () => {
    it("joins items with the Spanish conjunction", () => {
        expect(formatList(["ánimo", "energía", "sueño"], "and", "es")).toBe("ánimo, energía y sueño");
    });
});

describe("formatRelativeCalendarDay", () => {
    const base = new Date(2026, 5, 25, 9, 0, 0);

    it("says hoy for the same calendar day", () => {
        expect(formatRelativeCalendarDay(new Date(2026, 5, 25, 20, 0, 0), base, "es")).toBe("hoy");
    });

    it("says ayer for the previous day", () => {
        expect(formatRelativeCalendarDay(new Date(2026, 5, 24), base, "es")).toBe("ayer");
    });

    it("says mañana for the next day", () => {
        expect(formatRelativeCalendarDay(new Date(2026, 5, 26), base, "es")).toBe("mañana");
    });
});

describe("weekdayLabels", () => {
    it("returns 7 labels ordered from the device's first weekday (Monday)", () => {
        const labels = weekdayLabels("long", "es");
        expect(labels).toHaveLength(7);
        expect(labels[0]).toBe("Lunes");
    });
});
