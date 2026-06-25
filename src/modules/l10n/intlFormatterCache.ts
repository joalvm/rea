/**
 * Caché de formateadores `Intl`. Construir un `Intl.*Format` es costoso y los
 * mismos pares (locale + opciones) se repiten en listas y calendarios, así que se
 * memoizan por clave. Responsabilidad única: fabricar y cachear formateadores.
 */
const dateTimeFormatters = new Map<string, Intl.DateTimeFormat>();
const numberFormatters = new Map<string, Intl.NumberFormat>();
const relativeTimeFormatters = new Map<string, Intl.RelativeTimeFormat>();
const listFormatters = new Map<string, Intl.ListFormat>();

function cacheKey(locale: string, options?: object): string {
    return options ? `${locale}|${JSON.stringify(options)}` : locale;
}

export function getDateTimeFormat(locale: string, options?: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
    const key = cacheKey(locale, options);
    let formatter = dateTimeFormatters.get(key);
    if (!formatter) {
        formatter = new Intl.DateTimeFormat(locale, options);
        dateTimeFormatters.set(key, formatter);
    }
    return formatter;
}

export function getNumberFormat(locale: string, options?: Intl.NumberFormatOptions): Intl.NumberFormat {
    const key = cacheKey(locale, options);
    let formatter = numberFormatters.get(key);
    if (!formatter) {
        formatter = new Intl.NumberFormat(locale, options);
        numberFormatters.set(key, formatter);
    }
    return formatter;
}

export function getRelativeTimeFormat(
    locale: string,
    options?: Intl.RelativeTimeFormatOptions,
): Intl.RelativeTimeFormat {
    const key = cacheKey(locale, options);
    let formatter = relativeTimeFormatters.get(key);
    if (!formatter) {
        formatter = new Intl.RelativeTimeFormat(locale, options);
        relativeTimeFormatters.set(key, formatter);
    }
    return formatter;
}

export function getListFormat(locale: string, options?: Intl.ListFormatOptions): Intl.ListFormat {
    const key = cacheKey(locale, options);
    let formatter = listFormatters.get(key);
    if (!formatter) {
        formatter = new Intl.ListFormat(locale, options);
        listFormatters.set(key, formatter);
    }
    return formatter;
}
