import { describe, expect, it, jest } from "@jest/globals";

jest.mock("expo-localization", () => ({
    getLocales: () => [{ languageTag: "es-PE", languageCode: "es", regionCode: "PE" }],
}));

// eslint-disable-next-line import/first
import i18n from "@/modules/i18n/i18n";

describe("Inicialización de i18n", () => {
    it("se inicializa de forma sincrónica con recursos locales", () => {
        expect(i18n.isInitialized).toBe(true);
    });

    it("resuelve una clave del namespace home", () => {
        expect(i18n.t("hero.overline", { ns: "home" })).toBe("Tu estado de hoy");
    });

    it("interpela variables dentro de una cadena", () => {
        expect(i18n.t("hero.cycleDay", { ns: "home", day: 12 })).toBe("Día 12 del ciclo");
    });

    it("resuelve el texto de onboarding desde su namespace", () => {
        expect(i18n.t("welcome.title", { ns: "onboarding" })).toBe("Bienvenida a Rea");
    });

    it("resuelve el texto de onboarding en inglés", async () => {
        await i18n.changeLanguage("en");

        expect(i18n.t("welcome.title", { ns: "onboarding" })).toBe("Welcome to Rea");

        await i18n.changeLanguage("es");
    });
});
