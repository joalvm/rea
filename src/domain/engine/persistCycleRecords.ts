import { and, desc, eq, lt, sql } from "drizzle-orm";

import { type InsertCycleRecord, cycleRecord } from "@/db/schema/cycleRecord";
import { cyclePrediction } from "@/db/schema/cyclePrediction";
import uuid from "@/db/utils/uuid";
import { cycleStats } from "@/domain/cycle/cycleStats";
import { estimateOvulation } from "@/domain/cycle/estimateOvulation";
import type { CycleWindow } from "@/domain/cycle/types/CycleWindow";
import { addDays } from "@/domain/cycle/utils/addDays";
import { diffInDays } from "@/domain/cycle/utils/diffInDays";

import type { CycleEngineFacts } from "./loadCycleEngineFacts";
import type { CycleEngineTransaction } from "./types/CycleEngineTransaction";

const DEFAULT_LUTEAL_LENGTH = 14;
const MIN_BBT_CONFIRMED_CYCLES_FOR_PERSONALIZED_LUTEAL = 3;

function isClosedCycle(cycle: CycleWindow): cycle is CycleWindow & { endDate: string; cycleLength: number } {
    return cycle.endDate !== null && cycle.cycleLength !== null;
}

/**
 * Cierra los ciclos afectados (desde `reprojectFrom` en adelante) y los
 * persiste en `cycle_records`, copiando la predicción vigente antes de cada
 * inicio real (`prediction_error_days`). Recalcula en orden cronológico,
 * actualizando la historia de trabajo a medida que avanza: la fase lútea
 * personalizada de un ciclo depende de los ciclos ya cerrados antes que él, así
 * que una edición retroactiva repara en cascada todo lo que viene después.
 *
 * Devuelve la historia de ciclos (previos + recién cerrados) y el ciclo abierto,
 * insumos que `persistCyclePrediction` necesita para predecir el siguiente.
 */
export async function persistCycleRecords(
    tx: CycleEngineTransaction,
    facts: CycleEngineFacts,
): Promise<{ historicalCycles: CycleWindow[]; openCycle: CycleWindow | null }> {
    const affectedCycles = facts.derivedCycles.filter((cycle) => cycle.startDate >= facts.reprojectFrom);
    const closedCycles = affectedCycles.filter(isClosedCycle);
    const openCycle = affectedCycles.find((cycle) => cycle.endDate === null) ?? null;

    const historicalCycles: CycleWindow[] = [...facts.historicalCyclesBeforeReprojectStart];

    for (const cycle of closedCycles) {
        const stats = cycleStats(historicalCycles);
        const lutealLength =
            stats.bbtConfirmedOvulationCount >= MIN_BBT_CONFIRMED_CYCLES_FOR_PERSONALIZED_LUTEAL &&
            stats.lutealLengthMedian !== null
                ? stats.lutealLengthMedian
                : DEFAULT_LUTEAL_LENGTH;

        const nextStartDate = addDays(cycle.endDate, 1);
        const ovulation = estimateOvulation({
            cycleStartDate: cycle.startDate,
            expectedOrActualNextStartDate: nextStartDate,
            checkins: facts.checkinsInRange,
            lutealLength,
        });

        const priorPredictionRows = await tx
            .select({ predictedNextStart: cyclePrediction.predictedNextStart })
            .from(cyclePrediction)
            .where(
                and(eq(cyclePrediction.profileId, facts.profileId), lt(cyclePrediction.calculationDate, nextStartDate)),
            )
            .orderBy(desc(cyclePrediction.calculationDate))
            .limit(1);
        const predictedStart = priorPredictionRows.at(0)?.predictedNextStart ?? null;
        const predictionErrorDays = predictedStart !== null ? diffInDays(predictedStart, nextStartDate) : null;
        const lutealLengthObserved = diffInDays(ovulation.ovulationDate, nextStartDate);

        historicalCycles.push({
            ...cycle,
            ovulationDate: ovulation.ovulationDate,
            ovulationBasis: ovulation.ovulationBasis,
            lutealLength: lutealLengthObserved,
        });

        const now = new Date().toISOString();
        const row: InsertCycleRecord = {
            id: uuid(),
            profileId: facts.profileId,
            startDate: cycle.startDate,
            endDate: cycle.endDate,
            cycleLength: cycle.cycleLength,
            periodLength: cycle.periodLength,
            ovulationDate: ovulation.ovulationDate,
            ovulationBasis: ovulation.ovulationBasis,
            lutealLength: lutealLengthObserved,
            predictedStart,
            predictionErrorDays,
            isValid: cycle.isValid,
            excludedReason: cycle.excludedReason,
            createdAt: now,
            updatedAt: now,
        };

        await tx
            .insert(cycleRecord)
            .values(row)
            .onConflictDoUpdate({
                target: [cycleRecord.profileId, cycleRecord.startDate],
                set: {
                    endDate: row.endDate,
                    cycleLength: row.cycleLength,
                    periodLength: row.periodLength,
                    ovulationDate: row.ovulationDate,
                    ovulationBasis: row.ovulationBasis,
                    lutealLength: row.lutealLength,
                    predictedStart: row.predictedStart,
                    predictionErrorDays: row.predictionErrorDays,
                    isValid: row.isValid,
                    excludedReason: row.excludedReason,
                    updatedAt: row.updatedAt,
                    version: sql`${cycleRecord.version} + 1`,
                },
            });
    }

    return { historicalCycles, openCycle };
}
