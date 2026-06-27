/**
 * Modos nucleares que cambian la experiencia principal de la app.
 * Se usan para persistir la intencion reproductiva activa y adaptar predicciones, UI y contenido.
 */
export const reproductiveModeValues = ["cycle_tracking", "ttc", "pregnancy"] as const;

/**
 * Modos disponibles cuando una regla o catalogo puede aplicar a un modo especifico o a todos.
 * Extiende `reproductiveModeValues` con `all` para filtros y asignaciones transversales.
 */
export const reproductiveModeFilterValues = [...reproductiveModeValues, "all"] as const;

/**
 * Intenciones dentro del modo `cycle_tracking`.
 * Distinguen entre seguimiento neutral (`track_only`) y uso como anticonceptivo natural
 * mediante metodo del ritmo o sintotermico (`avoid_pregnancy`).
 * Solo aplica cuando `current_mode = 'cycle_tracking'`; es NULL en `ttc` y `pregnancy`.
 */
export const cycleIntentValues = ["track_only", "avoid_pregnancy"] as const;

/**
 * Regularidades declaradas para describir el patron del ciclo.
 * Se usan en onboarding y configuracion de prediccion para capturar la estabilidad percibida del ciclo.
 */
export const regularityValues = ["regular", "variable", "irregular"] as const;

/**
 * Union literal de los modos reproductivos principales de la app.
 * Importar este tipo cuando un contrato necesite aceptar uno de los valores de `reproductiveModeValues`.
 */
export type ReproductiveMode = (typeof reproductiveModeValues)[number];

/**
 * Union literal de intenciones admitidas dentro del modo ciclo.
 * Importar este tipo cuando un contrato deba tipar valores de `cycleIntentValues`.
 */
export type CycleIntent = (typeof cycleIntentValues)[number];

/**
 * Union literal de los modos validos para filtros o alcance de contenido.
 * Importar este tipo cuando una API pueda recibir un modo puntual o `all` desde `reproductiveModeFilterValues`.
 */
export type ReproductiveModeFilter = (typeof reproductiveModeFilterValues)[number];

/**
 * Union literal de regularidades admitidas para caracterizar el ciclo.
 * Importar este tipo cuando una mutacion o formulario deba tipar valores de `regularityValues`.
 */
export type Regularity = (typeof regularityValues)[number];
