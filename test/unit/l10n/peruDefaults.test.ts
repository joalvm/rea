import { describe, expect, it, jest } from "@jest/globals";

// Dispositivo sin región ni divisa: debe asumirse Perú (mercado principal).
jest.mock("expo-localization", () => ({
    getLocales: () => [{ languageTag: "es", languageCode: "es" }],
    getCalendars: () => [{ firstWeekday: 2 }],
}));

import { formatCurrency } from "@/modules/l10n/formatCurrency";
import { PRIMARY_REGION, resolveFormattingLocale } from "@/modules/l10n/resolveFormattingLocale";

describe("Peru as the default market", () => {
    it("assumes the Peru region when the device reports none", () => {
        expect(PRIMARY_REGION).toBe("PE");
        expect(resolveFormattingLocale()).toBe("es-PE");
    });

    it("falls back to the Peruvian sol when the system reports no currency", () => {
        expect(formatCurrency(1234.5)).toMatch(/S\/|PEN/);
    });
});
