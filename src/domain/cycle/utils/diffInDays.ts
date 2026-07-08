/**
 * Diferencia en días completos entre dos fechas `YYYY-MM-DD` (`to` − `from`), en
 * aritmética UTC pura (`Date.UTC`). Ver nota de zona horaria en `addDays`.
 */
export function diffInDays(from: string, to: string): number {
    const fromParts = from.split("-").map(Number);
    const toParts = to.split("-").map(Number);

    const fromUtc = Date.UTC(fromParts[0] ?? 1970, (fromParts[1] ?? 1) - 1, fromParts[2] ?? 1);
    const toUtc = Date.UTC(toParts[0] ?? 1970, (toParts[1] ?? 1) - 1, toParts[2] ?? 1);

    return Math.round((toUtc - fromUtc) / (1000 * 60 * 60 * 24));
}
