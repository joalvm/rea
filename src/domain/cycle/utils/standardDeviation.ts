/**
 * Desviación estándar muestral (denominador `n-1`). Devuelve `0` con menos de 2
 * valores, ya que la varianza no está definida y el motor la usa como "sin dispersión
 * conocida" en vez de propagar `NaN`.
 */
export function standardDeviation(values: number[]): number {
    if (values.length < 2) {
        return 0;
    }

    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);

    return Math.sqrt(variance);
}
