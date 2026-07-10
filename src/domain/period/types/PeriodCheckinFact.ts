import type { PeriodStatusSignal } from "@/db/enums/checkin";

/**
 * Hecho mínimo de check-in que necesita el dominio de reconciliación: intensidad
 * de sangrado (umbral de inferencia y de cierre por último sangrado real) y la
 * señal explícita de periodo que la usuaria pudo haber marcado ese día.
 */
export type PeriodCheckinFact = {
    localDate: string;
    bleedingIntensity: number | null;
    periodStatusSignal: PeriodStatusSignal | null;
};
