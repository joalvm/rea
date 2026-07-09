import { cyclePrediction, type InsertCyclePrediction } from "@/db/schema/cyclePrediction";
import { predictNextCycle } from "@/domain/cycle/predictNextCycle";
import type { CyclePredictionResult } from "@/domain/cycle/types/CyclePredictionResult";
import type { CycleWindow } from "@/domain/cycle/types/CycleWindow";

import type { CycleEngineFacts } from "./loadCycleEngineFacts";
import type { CycleEngineTransaction } from "./types/CycleEngineTransaction";

/**
 * Predice el siguiente ciclo con `predictNextCycle` (Fase 1) y lo persiste en
 * `cycle_predictions`. Esa tabla es un log (PK `profileId + calculation_date`),
 * no una fila única: "vigente" es la de `calculation_date` más reciente. Siempre
 * inserta con `calculationDate = hoy`; el `onConflictDoUpdate` solo hace
 * idempotente un recálculo repetido el mismo día.
 *
 * Sin ciclo abierto, sin intención vigente, o cuando `predictNextCycle` decide
 * que no hay base para predecir (pausado o posparto sin ancla), no se escribe
 * ninguna fila — la tabla no puede representar "sin predicción" (sus columnas
 * clave son NOT NULL), así que la ausencia de una fila de hoy ES la señal.
 */
export async function persistCyclePrediction(
    tx: CycleEngineTransaction,
    facts: CycleEngineFacts,
    historicalCycles: CycleWindow[],
    openCycle: CycleWindow | null,
): Promise<CyclePredictionResult> {
    if (openCycle === null || facts.activeIntentToday === null) {
        return null;
    }

    const prediction = predictNextCycle({
        today: facts.today,
        cycles: [...historicalCycles, openCycle],
        intent: facts.activeIntentToday,
        checkinsInOpenCycle: facts.checkinsInRange,
        isPaused: facts.isPaused,
        hasPostpartumAnchor: facts.hasPostpartumAnchor,
    });

    if (prediction === null) {
        return null;
    }

    const row: InsertCyclePrediction = {
        profileId: facts.profileId,
        calculationDate: facts.today,
        predictedNextStart: prediction.predictedNextStart,
        predictedOvulation: prediction.predictedOvulation,
        predictedFertileStart: prediction.fertileWindow.suppressed ? null : prediction.fertileWindow.start,
        predictedFertileEnd: prediction.fertileWindow.suppressed ? null : prediction.fertileWindow.end,
        predictedPeriodLength: prediction.predictedPeriodLength,
        cycleLengthUsed: prediction.cycleLengthUsed,
        lutealPhaseUsed: prediction.lutealPhaseUsed,
        confidence: prediction.confidence,
    };

    await tx
        .insert(cyclePrediction)
        .values(row)
        .onConflictDoUpdate({
            target: [cyclePrediction.profileId, cyclePrediction.calculationDate],
            set: {
                predictedNextStart: row.predictedNextStart,
                predictedOvulation: row.predictedOvulation,
                predictedFertileStart: row.predictedFertileStart,
                predictedFertileEnd: row.predictedFertileEnd,
                predictedPeriodLength: row.predictedPeriodLength,
                cycleLengthUsed: row.cycleLengthUsed,
                lutealPhaseUsed: row.lutealPhaseUsed,
                confidence: row.confidence,
            },
        });

    return prediction;
}
