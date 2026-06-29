/**
 * Modos de seguimiento reproductivo: combinan en un único eje el tipo de
 * seguimiento y la intención. Reemplazan al antiguo par (current_mode, cycle_intent).
 * Se usan para persistir la intención activa y adaptar predicciones, UI y contenido.
 *
 * - `tracking_only`: seguimiento neutral del ciclo.
 * - `tracking_avoid_pregnancy`: seguimiento con foco anticonceptivo natural (ritmo/sintotérmico).
 * - `tracking_ttc`: seguimiento para buscar embarazo (ventana fértil, tests, BBT).
 * - `pregnancy_tracking`: seguimiento del embarazo (pausa el ciclo, activa semana gestacional).
 */
export const reproductiveModeValues = [
    "tracking_only",
    "tracking_avoid_pregnancy",
    "tracking_ttc",
    "pregnancy_tracking",
] as const;

/**
 * Modos disponibles cuando una regla o catálogo puede aplicar a un modo específico o a todos.
 * Extiende `reproductiveModeValues` con `all` para filtros y asignaciones transversales
 * (segmentación de contenido y síntomas).
 */
export const reproductiveModeFilterValues = [...reproductiveModeValues, "all"] as const;

/**
 * Regularidades declaradas para describir el patrón del ciclo.
 * Se usan en onboarding y configuración de predicción para capturar la estabilidad percibida del ciclo.
 */
export const regularityValues = ["regular", "variable", "irregular"] as const;

/**
 * Unión literal de los modos de seguimiento reproductivo principales de la app.
 * Importar este tipo cuando un contrato necesite aceptar uno de los valores de `reproductiveModeValues`.
 */
export type ReproductiveMode = (typeof reproductiveModeValues)[number];

/**
 * Unión literal de los modos válidos para filtros o alcance de contenido.
 * Importar este tipo cuando una API pueda recibir un modo puntual o `all` desde `reproductiveModeFilterValues`.
 */
export type ReproductiveModeFilter = (typeof reproductiveModeFilterValues)[number];

/**
 * Unión literal de las regularidades admitidas para caracterizar el ciclo.
 * Importar este tipo cuando una mutación o formulario deba tipar valores de `regularityValues`.
 */
export type Regularity = (typeof regularityValues)[number];

/**
 * ¿Es el modo de seguimiento de embarazo? Útil para ramificar ciclo vs embarazo
 * (predicciones, rachas de periodo, episodios de embarazo) sin repetitar el literal.
 */
export function isPregnancyMode(mode: ReproductiveMode): boolean {
    return mode === "pregnancy_tracking";
}
