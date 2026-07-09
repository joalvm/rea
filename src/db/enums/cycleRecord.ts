/**
 * Bases de evidencia con las que el motor de ciclo confirma una ovulación al
 * cerrar un ciclo. Jerarquía de confianza: `bbt` > `opk` > `mucus` > `calendar`.
 */
export const ovulationBasisValues = ["bbt", "opk", "mucus", "calendar"] as const;

/**
 * Unión literal de las bases de ovulación admitidas por `cycle_records`.
 * Importar este tipo cuando un contrato necesite aceptar uno de los valores de `ovulationBasisValues`.
 */
export type OvulationBasis = (typeof ovulationBasisValues)[number];
