import { getLocaleFormats } from "./resources";

type DateInput = Date | string;

export function formatLongDate(value: DateInput) {
    const formats = getLocaleFormats();
    const label = new Intl.DateTimeFormat(formats.locale, {
        day: "numeric",
        month: "long",
        weekday: "long",
    }).format(toDate(value));

    return capitalize(label);
}

export function formatFullDate(value: DateInput) {
    const formats = getLocaleFormats();
    return new Intl.DateTimeFormat(formats.locale, {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(toDate(value));
}

export function formatShortDate(value: DateInput) {
    const formats = getLocaleFormats();
    return new Intl.DateTimeFormat(formats.locale, {
        day: "numeric",
        month: "short",
    }).format(toDate(value));
}

export function formatMonthYear(value: DateInput) {
    const formats = getLocaleFormats();
    const label = new Intl.DateTimeFormat(formats.locale, {
        month: "long",
        year: "numeric",
    }).format(toDate(value));

    return capitalize(label);
}

export function formatMonthName(value: DateInput) {
    const formats = getLocaleFormats();
    const label = new Intl.DateTimeFormat(formats.locale, { month: "long" }).format(toDate(value));

    return capitalize(label);
}

export function formatTime(value: DateInput) {
    const formats = getLocaleFormats();
    return new Intl.DateTimeFormat(formats.locale, {
        hour: "2-digit",
        minute: "2-digit",
    }).format(toDate(value));
}

export function formatNumber(value: number) {
    const formats = getLocaleFormats();
    return new Intl.NumberFormat(formats.locale).format(value);
}

export function formatCurrency(value: number) {
    const formats = getLocaleFormats();
    return new Intl.NumberFormat(formats.locale, {
        currency: formats.currency.code,
        style: "currency",
    }).format(value);
}

export function getWeekdayNarrowLabels() {
    return getLocaleFormats().weekdays.narrow;
}

function toDate(value: DateInput) {
    if (value instanceof Date) {
        return value;
    }

    if (value.includes("T")) {
        return new Date(value);
    }

    const [year, month, day] = value.split("-").map(Number);
    return new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1, 12, 0, 0, 0);
}

function capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
