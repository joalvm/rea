/**
 * Mediana de una lista de números. Robusta a outliers (a diferencia de la media),
 * clave para longitud de ciclo/periodo. El llamador garantiza `values.length > 0`.
 */
export function median(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return ((sorted[middle - 1] ?? 0) + (sorted[middle] ?? 0)) / 2;
    }

    return sorted[middle] ?? 0;
}
