/** Calcula promedio simple con fallback seguro a cero. */
export function average(values: number[]): number {
    if (values.length === 0) {
        return 0;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Redondea promedio observado o usa fallback dentro de rango permitido. */
export function roundOrFallback(values: number[], fallback: number, min: number, max: number) {
    if (values.length === 0) {
        return fallback;
    }

    return clamp(Math.round(average(values)), min, max);
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}
