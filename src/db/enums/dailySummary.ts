/**
 * Formas en que la app justifica que un dia cuente como menstruacion en el resumen diario.
 * Distingue ausencia de evidencia, confirmacion explicita o inferencia por sangrado observado.
 */
export const menstruationBasisValues = ["none", "confirmed_period", "inferred_bleeding"] as const;

/**
 * Fases de ciclo o embarazo que la proyeccion diaria puede asignar a una fecha.
 * Se usan en calendario, hero y capas de prediccion para resumir el estado fisiologico estimado.
 */
export const estimatedPhaseValues = [
    "unknown",
    "menstrual",
    "follicular",
    "fertile_window",
    "estimated_ovulation",
    "luteal",
    "pregnancy_first_trimester",
    "pregnancy_second_trimester",
    "pregnancy_third_trimester",
] as const;

/**
 * Origen de la fase estimada en `daily_summary`.
 * Permite diferenciar observacion directa, inferencia del motor o ausencia de informacion fiable.
 */
export const phaseSourceValues = ["observed", "estimated", "unknown"] as const;

/**
 * Union literal de las bases validas para marcar un dia menstrual.
 * Importar este tipo cuando una API de resumen diario necesite aceptar un valor de `menstruationBasisValues`.
 */
export type MenstruationBasis = (typeof menstruationBasisValues)[number];

/**
 * Union literal de fases que el resumen diario puede exponer a la UI.
 * Importar este tipo cuando un componente o servicio de prediccion trabaje con `estimatedPhaseValues`.
 */
export type EstimatedPhase = (typeof estimatedPhaseValues)[number];

/**
 * Union literal del origen admitido para una fase proyectada.
 * Importar este tipo cuando se modele la procedencia de una fase derivada de `phaseSourceValues`.
 */
export type PhaseSource = (typeof phaseSourceValues)[number];
