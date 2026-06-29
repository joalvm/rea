import { describe, expect, it, jest } from "@jest/globals";

// Dispositivo sin región ni divisa: debe asumirse Perú (mercado principal).
jest.mock("expo-localization", () => ({
    getLocales: () => [{ languageTag: "es", languageCode: "es" }],
    getCalendars: () => [{ firstWeekday: 2 }],
}));

import { formatCurrency } from "@/modules/l10n/formatCurrency";
import { PRIMARY_REGION, resolveFormattingLocale } from "@/modules/l10n/resolveFormattingLocale";

describe("Perú como mercado por defecto", () => {
    it("asume la región de Perú cuando el dispositivo no reporta ninguna", () => {
        expect(PRIMARY_REGION).toBe("PE");
        expect(resolveFormattingLocale()).toBe("es-PE");
    });

    it("cae al sol peruano cuando el sistema no reporta moneda", () => {
        expect(formatCurrency(1234.5)).toMatch(/S\/|PEN/);
    });
});
