/** Normaliza fecha local a ISO YYYY-MM-DD. */
export function toIsoDate(date: Date): string {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/** Parsea fecha ISO usando mediodía para evitar desfases locales. */
export function parseIsoDate(iso: string): Date {
    const [year, month, day] = iso.split("-").map(Number);
    return new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1, 12, 0, 0, 0);
}

/** Suma días a fecha ISO manteniendo formato local estable. */
export function addDays(iso: string, days: number): string {
    const date = parseIsoDate(iso);
    date.setDate(date.getDate() + days);
    return toIsoDate(date);
}

/** Calcula diferencia entera de días entre dos fechas ISO. */
export function daysBetween(startIso: string, endIso: string): number {
    const start = parseIsoDate(startIso).getTime();
    const end = parseIsoDate(endIso).getTime();
    return Math.round((end - start) / 86400000);
}

/** Formatea fecha breve para copy de UI. */
export function formatShortDate(iso: string): string {
    const date = parseIsoDate(iso);
    return date.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
}

/** Construye título de mes con capitalización local. */
export function monthTitle(date: Date): string {
    const title = date.toLocaleDateString("es-PE", { month: "long", year: "numeric" });
    return title.charAt(0).toUpperCase() + title.slice(1);
}
