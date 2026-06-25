import { getNumberFormat } from "./intlFormatterCache";
import { resolveFormattingLocale } from "./resolveFormattingLocale";

/**
 * Formatea un número al locale de formato activo (separadores de miles y decimales
 * locales). Acepta cualquier opción de `Intl.NumberFormat` (p. ej. `maximumFractionDigits`).
 */
export function formatNumber(value: number, options?: Intl.NumberFormatOptions, localeOverride?: string): string {
    return getNumberFormat(resolveFormattingLocale(localeOverride), options).format(value);
}
