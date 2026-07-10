import type { PeriodRunStatus } from "@/db/enums/periodRun";

/**
 * Hecho mínimo de racha de periodo que necesita el dominio de reconciliación:
 * detectar inicios/cierres pendientes y validar solapes o fusión contra rachas
 * vecinas. Recortado del esquema completo de `period_runs`.
 */
export type PeriodRunSnapshot = {
    startDate: string;
    endDate: string | null;
    status: PeriodRunStatus;
};
