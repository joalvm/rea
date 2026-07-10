import type { PeriodRunSnapshot } from "./types/PeriodRunSnapshot";

/** Fecha centinela para tratar una racha abierta como vigente hasta hoy y más allá. */
const OPEN_RUN_SENTINEL_END_DATE = "9999-12-31";

export type PeriodRunOverlapResult = {
    hasOverlap: boolean;
    conflictingRun: PeriodRunSnapshot | null;
};

/**
 * Valida que un rango candidato (nueva racha o edición de una existente) no se
 * solape con ninguna racha vecina. Las rachas `excluded` no cuentan — un tramo
 * descartado del motor tampoco bloquea el calendario real (plan 03, "solapes
 * imposibles"). Una racha abierta sin `endDate` se trata como vigente hasta hoy
 * y más allá: nada puede empezar mientras la anterior sigue abierta.
 */
export function validatePeriodRunOverlap(
    existingRuns: PeriodRunSnapshot[],
    candidate: { startDate: string; endDate: string | null },
): PeriodRunOverlapResult {
    const candidateEnd = candidate.endDate ?? OPEN_RUN_SENTINEL_END_DATE;

    const conflictingRun = existingRuns.find((run) => {
        if (run.status === "excluded") {
            return false;
        }

        const runEnd = run.endDate ?? OPEN_RUN_SENTINEL_END_DATE;

        return candidate.startDate <= runEnd && run.startDate <= candidateEnd;
    });

    return { hasOverlap: conflictingRun !== undefined, conflictingRun: conflictingRun ?? null };
}
