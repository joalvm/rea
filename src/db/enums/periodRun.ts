/**
 * Estados persistibles de una racha de periodo.
 * Se usan para diferenciar episodios abiertos, cerrados o descartados del historial menstrual.
 */
export const periodRunStatusValues = ["open", "closed", "excluded"] as const;

/**
 * Origen del dato que creo o ajusto una racha de periodo.
 * Permite distinguir confirmacion manual, inferencia por sangrado o un origen mixto.
 */
export const periodRunSourceValues = ["user_confirmed", "bleeding_inferred", "mixed"] as const;

/**
 * Union literal del estado admitido para una racha de periodo.
 * Importar este tipo cuando una entidad o mutacion necesite restringirse a `periodRunStatusValues`.
 */
export type PeriodRunStatus = (typeof periodRunStatusValues)[number];

/**
 * Union literal del origen admitido para una racha de periodo.
 * Importar este tipo cuando una API o helper modele valores de `periodRunSourceValues`.
 */
export type PeriodRunSource = (typeof periodRunSourceValues)[number];
