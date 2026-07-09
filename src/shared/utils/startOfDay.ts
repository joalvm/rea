/** Devuelve una copia de la fecha a las 00:00:00 locales (sin mutar la original). */
export function startOfDay(date: Date): Date {
    const copy = new Date(date);
    copy.setHours(0, 0, 0, 0);
    return copy;
}
