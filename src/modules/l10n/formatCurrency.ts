import { getLocales } from "expo-localization";

import { getNumberFormat } from "./intlFormatterCache";
import { resolveFormattingLocale } from "./resolveFormattingLocale";

/** Divisa del mercado principal (Perú): último recurso si el sistema no la indica. */
const DEFAULT_CURRENCY = "PEN";

/**
 * Formatea un importe como moneda. La divisa se toma del sistema
 * (`getLocales()[0].currencyCode`) por defecto, o se fuerza con `currency` (ISO
 * 4217) cuando un precio debe ir en una divisa de mercado fija. El formato del
 * número (símbolo, separadores) lo aplica `Intl` según el locale.
 */
export function formatCurrency(value: number, currency?: string, localeOverride?: string): string {
    const locale = resolveFormattingLocale(localeOverride);
    const code = currency ?? getLocales()[0]?.currencyCode ?? DEFAULT_CURRENCY;
    return getNumberFormat(locale, { style: "currency", currency: code }).format(value);
}
