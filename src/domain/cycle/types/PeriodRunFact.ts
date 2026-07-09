import type { PeriodRunStatus } from "@/db/enums/periodRun";

/**
 * Hecho mínimo de racha de periodo que necesita el algoritmo puro de ciclo para
 * derivar ciclos. Recortado del esquema completo de `period_runs` a solo lo que
 * `deriveCycles` consume.
 */
export type PeriodRunFact = {
    startDate: string;
    endDate: string | null;
    status: PeriodRunStatus;
};
