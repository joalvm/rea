import type { Database } from "@/db/client";

import { loadCycleEngineFacts } from "./loadCycleEngineFacts";
import { persistCyclePrediction } from "./persistCyclePrediction";
import { persistCycleRecords } from "./persistCycleRecords";
import { persistDailySummaries } from "./persistDailySummaries";
import type { ChangedRange } from "./types/ChangedRange";
import type { CycleEngineTransaction } from "./types/CycleEngineTransaction";

/**
 * Recalcula el motor de ciclo tras una escritura relevante. Cada mutación de
 * dominio que cambia hechos observables debe invocarlo desde su propia
 * transacción mediante `recalculateInTransaction`:
 *
 * - Periodo: abrir, cerrar o editar un `period_run` (incluye excluirlo).
 * - Check-in: crear, editar o excluir un check-in (`excludedFromSummary`).
 * - Intención: cambiar `reproductive_mode`, método anticonceptivo o lactancia.
 * - Embarazo: abrir o cerrar un `pregnancy_episode`.
 *
 * En todos los casos, `changedRange.from` es la fecha más antigua tocada por la
 * escritura (p. ej. el `startDate` de un periodo editado, o el `localDate` de un
 * check-in). Todo corre en una única transacción: cerrar ciclos, predecir el
 * siguiente y reproyectar `daily_summary` se confirman o revierten juntos.
 */
export async function recalculate(database: Database, changedRange: ChangedRange): Promise<void> {
    await database.transaction((tx) => recalculateInTransaction(tx as CycleEngineTransaction, changedRange));
}

/** Ejecuta la proyección usando una transacción ya abierta por la mutación dueña. */
export async function recalculateInTransaction(tx: CycleEngineTransaction, changedRange: ChangedRange): Promise<void> {
    const facts = await loadCycleEngineFacts(tx, changedRange);
    const { historicalCycles, openCycle } = await persistCycleRecords(tx, facts);
    const prediction = await persistCyclePrediction(tx, facts, historicalCycles, openCycle);
    await persistDailySummaries(tx, facts, historicalCycles, openCycle, prediction);
}
