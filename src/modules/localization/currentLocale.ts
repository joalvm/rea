import { getLocales } from "expo-localization";

export type AppLanguage = "es";
export type AppRegion = "PE";
export type AppLocale = "es-PE";

export const selectedLanguage: AppLanguage = "es";
export const selectedRegion: AppRegion = "PE";
export const selectedLocale: AppLocale = "es-PE";

export const deviceLocales = getLocales();
