/**
 * Suma (o resta, con `days` negativo) días a una fecha `YYYY-MM-DD` en aritmética
 * UTC pura (`Date.UTC`). No reusa `toCalendarDate` (ese helper ancla a mediodía
 * local para *mostrar* fechas en UI; el conteo de días del motor de ciclo necesita
 * ser 100% estable ante zona horaria/DST, sin componente de hora local).
 */
export function addDays(date: string, days: number): string {
    const parts = date.split("-").map(Number);
    const year = parts[0] ?? 1970;
    const month = parts[1] ?? 1;
    const day = parts[2] ?? 1;
    const result = new Date(Date.UTC(year, month - 1, day + days));

    const resultYear = result.getUTCFullYear();
    const resultMonth = String(result.getUTCMonth() + 1).padStart(2, "0");
    const resultDay = String(result.getUTCDate()).padStart(2, "0");

    return `${resultYear}-${resultMonth}-${resultDay}`;
}
