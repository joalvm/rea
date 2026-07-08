import type { Database } from "@/db/client";

import { loadCycleEngineFacts } from "./loadCycleEngineFacts";
import { persistCyclePrediction } from "./persistCyclePrediction";
import { persistCycleRecords } from "./persistCycleRecords";
import { persistDailySummaries } from "./persistDailySummaries";
import type { ChangedRange } from "./types/ChangedRange";
import type { CycleEngineTransaction } from "./types/CycleEngineTransaction";

/**
 * Recalcula el motor de ciclo tras una escritura relevante. Disparadores
 * documentados (hoy nadie los invoca todavía: check-in/periodo/embarazo son
 * pantallas placeholder — los features que dueñan cada mutación lo harán al
 * construir su escritura real):
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
    await database.transaction(async (tx) => {
        const engineTx = tx as CycleEngineTransaction;
        const facts = await loadCycleEngineFacts(engineTx, changedRange);
        const { historicalCycles, openCycle } = await persistCycleRecords(engineTx, facts);
        const prediction = await persistCyclePrediction(engineTx, facts, historicalCycles, openCycle);
        await persistDailySummaries(engineTx, facts, historicalCycles, openCycle, prediction);
    });
}
