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

/**
 * Procedencia de la fecha ancla del episodio: qué dato declaró la usuaria.
 * `lmp` = última menstruación, `due_date` = fecha probable de parto (dada por su
 * médica), `ultrasound` = datación por ecografía (aún no editable, entra con plan 09).
 */
export const datingBasisValues = ["lmp", "due_date", "ultrasound"] as const;

/**
 * Union literal de la procedencia de datación admitida.
 * Importar este tipo cuando una mutacion o entidad necesite aceptar solo valores de `datingBasisValues`.
 */
export type DatingBasis = (typeof datingBasisValues)[number];
