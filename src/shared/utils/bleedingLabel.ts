/**
 * Mapea la intensidad de sangrado (0-4) a la clave de i18n del namespace `diary`
 * (`bleedingLabel.*`) para mostrar una etiqueta legible. Si el valor es nulo
 * devuelve la clave `none`.
 *
 * Escala usada en el dominio (`checkin.bleedingIntensity`):
 * - 0 → none (sin sangrado)
 * - 1, 2 → light (leve)
 * - 3 → moderate (moderado)
 * - 4 → heavy (abundante)
 */
export function bleedingKey(intensity: number | null | undefined): string {
    if (intensity == null || intensity <= 0) {
        return "bleedingLabel.none";
    }
    if (intensity <= 2) {
        return "bleedingLabel.light";
    }
    if (intensity === 3) {
        return "bleedingLabel.moderate";
    }
    return "bleedingLabel.heavy";
}
