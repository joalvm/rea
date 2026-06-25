import { describe, expect, it, jest } from "@jest/globals";

jest.mock("expo-localization", () => ({
    getLocales: () => [{ languageTag: "es-PE", languageCode: "es", regionCode: "PE" }],
}));

import i18n from "@/modules/i18n/i18n";

describe("i18n", () => {
    it("initializes synchronously with local resources", () => {
        expect(i18n.isInitialized).toBe(true);
    });

    it("resolves a key from the today namespace", () => {
        expect(i18n.t("hero.overline", { ns: "today" })).toBe("Tu fase de hoy");
    });

    it("interpolates variables into a string", () => {
        expect(i18n.t("hero.cycleDay", { ns: "today", day: 12 })).toBe("Día 12 del ciclo");
    });

    it("resolves a key from the onboarding namespace", () => {
        expect(i18n.t("welcome.title", { ns: "onboarding" })).toBe("Bienvenida a Rea");
    });
});
