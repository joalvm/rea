import { diffInDays } from "@/domain/cycle/utils/diffInDays";

/** Días de pausa dentro de los cuales un nuevo inicio se propone como la misma racha. */
export const MERGE_GAP_THRESHOLD_DAYS = 3;

/**
 * Regla de fusión (plan 03): un nuevo inicio a menos de `MERGE_GAP_THRESHOLD_DAYS`
 * días de un cierre reciente es probablemente una pausa dentro de la misma regla,
 * no una racha nueva. Aplica sea cual sea el origen del nuevo inicio (señal
 * explícita, CTA o inferencia) — la fusión es sobre la fecha, no sobre `source`.
 */
export function shouldMergePeriodRuns(closedRunEndDate: string, newStartDate: string): boolean {
    const gapDays = diffInDays(closedRunEndDate, newStartDate);

    return gapDays >= 0 && gapDays < MERGE_GAP_THRESHOLD_DAYS;
}
