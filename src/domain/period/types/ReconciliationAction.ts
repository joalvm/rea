/**
 * Acción que `reconcilePeriodState` sugiere para una racha de periodo. Una
 * propuesta jamás se aplica sola — siempre espera confirmación explícita de la
 * usuaria (plan 03, decisión "una racha inferida jamás se crea en silencio").
 */
export type ReconciliationAction =
    | { type: "proponer_inicio"; startDate: string; source: "bleeding_inferred" }
    | { type: "proponer_cierre"; endDate: string; reason: "signal_ended" | "inactivity_prompt" }
    | { type: "proponer_fusión"; closedRunEndDate: string; newStartDate: string; gapDays: number }
    | { type: "nada" };
