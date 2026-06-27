/**
 * Estados discretos que un check-in puede emitir para marcar el avance de un periodo.
 * Se reutilizan en la tabla `checkins` y en reglas que interpretan inicio, fin o continuidad del sangrado.
 */
export const periodStatusSignalValues = ["started", "ended", "ongoing"] as const;

/**
 * Resultado cualitativo compartido por tests binarios registrados en un check-in.
 * Aplica a tests como OPK y embarazo, donde el dato persistido es una etiqueta de resultado.
 */
export const qualitativeTestResultValues = ["negative", "positive", "invalid"] as const;

/**
 * Union literal de las senales de estado de periodo permitidas para un check-in.
 * Importar este tipo cuando una mutacion o helper espere exactamente un valor de `periodStatusSignalValues`.
 */
export type PeriodStatusSignal = (typeof periodStatusSignalValues)[number];

/**
 * Union literal del resultado permitido para tests cualitativos en check-ins.
 * Importar este tipo cuando una API modele resultados derivados de `qualitativeTestResultValues`.
 */
export type QualitativeTestResult = (typeof qualitativeTestResultValues)[number];
