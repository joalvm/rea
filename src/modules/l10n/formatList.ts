import { getListFormat } from "./intlFormatterCache";
import { resolveFormattingLocale } from "./resolveFormattingLocale";

/** "y" (conjunción) u "o" (disyunción). */
export type ListStyle = "and" | "or";

/**
 * Une una lista de forma natural y local: `["A", "B", "C"]` ⇒ "A, B y C" (o "… o C"
 * con `style="or"`). Usa `Intl.ListFormat`; si el motor no lo implementa, cae a una
 * unión simple en español.
 */
export function formatList(items: readonly string[], style: ListStyle = "and", localeOverride?: string): string {
    const type = style === "or" ? "disjunction" : "conjunction";

    if (typeof Intl.ListFormat !== "function") {
        return items.join(style === "or" ? " o " : " y ");
    }

    const locale = resolveFormattingLocale(localeOverride);
    return getListFormat(locale, { type, style: "long" }).format(items as string[]);
}
