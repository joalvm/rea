import { getLocales } from "expo-localization";
import i18n from "i18next";

/** Mercado principal de Rea: si el sistema no indica región, se asume Perú. */
export const PRIMARY_REGION = "PE";

/**
 * Locale BCP-47 para formatear con `Intl`, separado a propósito del idioma de la
 * UI: toma el idioma activo de i18next y le añade la región del sistema
 * (`es` + `PE` ⇒ `es-PE`), para que números, fechas y moneda salgan locales.
 * Si el dispositivo no reporta región, usa Perú (mercado principal).
 *
 * Acepta un `override` explícito para formatear puntualmente en otro locale.
 */
export function resolveFormattingLocale(override?: string): string {
    if (override) {
        return override;
    }

    const language = i18n.language || "es";
    if (language.includes("-")) {
        return language;
    }

    const region = getLocales()[0]?.regionCode ?? PRIMARY_REGION;
    return `${language}-${region}`;
}
