import { describe, expect, it, jest } from "@jest/globals";

jest.mock("expo-localization", () => ({
    getLocales: () => [{ languageTag: "es-PE", languageCode: "es", regionCode: "PE" }],
}));

// eslint-disable-next-line import/first
import i18n from "@/modules/i18n/i18n";

describe("i18n", () => {
    it("initializes synchronously with local resources", () => {
        expect(i18n.isInitialized).toBe(true);
    });

    it("resolves a key from the preview namespace", () => {
        expect(i18n.t("hero.overline", { ns: "preview" })).toBe("Tu fase de hoy");
    });

    it("interpolates variables into a string", () => {
        expect(i18n.t("hero.cycleDay", { ns: "preview", day: 12 })).toBe("Día 12 del ciclo");
    });

    it("resolves onboarding copy from the preview namespace", () => {
        expect(i18n.t("welcome.title", { ns: "preview" })).toBe("Bienvenida a Rea");
    });

    it("resolves preview copy in english", async () => {
        await i18n.changeLanguage("en");

        expect(i18n.t("welcome.title", { ns: "preview" })).toBe("Welcome to Rea");

        await i18n.changeLanguage("es");
    });
});
