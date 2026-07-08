import type { OvulationBasis } from "@/db/enums/cycleRecord";

/**
 * Resultado de `estimateOvulation`. Siempre resuelve una fecha: el calendario
 * (`próximo inicio − lútea`) es el último nivel de la jerarquía de evidencia y
 * siempre está disponible una vez se conoce el siguiente inicio (real o predicho).
 * `ovulationBasis` es lo que distingue evidencia real de un supuesto de calendario.
 */
export type OvulationEstimate = {
    ovulationDate: string;
    ovulationBasis: OvulationBasis;
};
