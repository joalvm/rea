import { getLocales } from "expo-localization";

import { FALLBACK_LANGUAGE, SUPPORTED_LANGUAGES } from "@/modules/config/localeCatalog";

/**
 * Idioma de la UI tomado del sistema (Android/iOS). La usuaria no elige idioma
 * dentro de la app. Devuelve el primer idioma del dispositivo que soportamos, o
 * el de respaldo.
 */
export function detectDeviceLanguage(): string {
    const supported: readonly string[] = SUPPORTED_LANGUAGES;
    for (const locale of getLocales()) {
        if (locale.languageCode && supported.includes(locale.languageCode)) {
            return locale.languageCode;
        }
    }
    return FALLBACK_LANGUAGE;
}
