import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockGetLocales = jest.fn();

jest.mock("expo-localization", () => ({
    getLocales: () => mockGetLocales(),
}));

// eslint-disable-next-line import/first
import { detectDeviceLanguage } from "@/modules/i18n/deviceLanguage";

describe("Detección del idioma del dispositivo", () => {
    beforeEach(() => {
        mockGetLocales.mockReset();
    });

    it("devuelve el idioma del dispositivo cuando es compatible", () => {
        mockGetLocales.mockReturnValue([{ languageTag: "es-PE", languageCode: "es", regionCode: "PE" }]);
        expect(detectDeviceLanguage()).toBe("es");
    });

    it("recurre al valor de respaldo cuando el idioma del dispositivo no es compatible", () => {
        mockGetLocales.mockReturnValue([{ languageTag: "fr-FR", languageCode: "fr", regionCode: "FR" }]);
        expect(detectDeviceLanguage()).toBe("es");
    });

    it("recurre al valor de respaldo cuando el dispositivo no reporta locales", () => {
        mockGetLocales.mockReturnValue([]);
        expect(detectDeviceLanguage()).toBe("es");
    });
});
