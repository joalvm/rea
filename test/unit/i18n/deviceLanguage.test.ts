import { beforeEach, describe, expect, it, jest } from "@jest/globals";

const mockGetLocales = jest.fn();

jest.mock("expo-localization", () => ({
    getLocales: () => mockGetLocales(),
}));

import { detectDeviceLanguage } from "@/modules/i18n/deviceLanguage";

describe("detectDeviceLanguage", () => {
    beforeEach(() => {
        mockGetLocales.mockReset();
    });

    it("returns the device language when it is supported", () => {
        mockGetLocales.mockReturnValue([{ languageTag: "es-PE", languageCode: "es", regionCode: "PE" }]);
        expect(detectDeviceLanguage()).toBe("es");
    });

    it("falls back when the device language is not supported", () => {
        mockGetLocales.mockReturnValue([{ languageTag: "en-US", languageCode: "en", regionCode: "US" }]);
        expect(detectDeviceLanguage()).toBe("es");
    });

    it("falls back when the device reports no locales", () => {
        mockGetLocales.mockReturnValue([]);
        expect(detectDeviceLanguage()).toBe("es");
    });
});
