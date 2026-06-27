/**
 * Desenlaces reconocidos para cerrar un episodio de embarazo.
 * Se usan para persistir el resultado clinico sin mezclarlo con notas libres o detalle narrativo.
 */
export const pregnancyOutcomeValues = ["birth", "loss", "other"] as const;

/**
 * Union literal del desenlace permitido para un episodio de embarazo.
 * Importar este tipo cuando una mutacion o entidad necesite aceptar solo valores de `pregnancyOutcomeValues`.
 */
export type PregnancyOutcome = (typeof pregnancyOutcomeValues)[number];
