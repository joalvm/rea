import { getNumberFormat } from "./intlFormatterCache";
import { resolveFormattingLocale } from "./resolveFormattingLocale";

/**
 * Formatea una fracción como porcentaje local. La entrada es una proporción
 * (`0.42` ⇒ "42 %"). `fractionDigits` fija los decimales mostrados.
 */
export function formatPercent(value: number, fractionDigits = 0, localeOverride?: string): string {
    const locale = resolveFormattingLocale(localeOverride);
    return getNumberFormat(locale, {
        style: "percent",
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    }).format(value);
}
