import { dailySummary } from "@/db/schema/dailySummary";
import type { CyclePredictionResult } from "@/domain/cycle/types/CyclePredictionResult";
import type { CycleWindow } from "@/domain/cycle/types/CycleWindow";
import { projectRange } from "@/domain/projection/projectRange";

import type { CycleEngineFacts } from "./loadCycleEngineFacts";
import type { CycleEngineTransaction } from "./types/CycleEngineTransaction";

function maxDate(a: string, b: string): string {
    return a > b ? a : b;
}

/**
 * Reproyecta `daily_summary` en `[reprojectFrom, horizonte]` y persiste cada fila.
 * El horizonte es `predictedNextStart` cuando hay predicción (para pre-poblar los
 * días futuros hasta el próximo inicio: ventana fértil venidera, etc.) o `today`
 * cuando no la hay — nunca se proyecta más allá de lo que hay base para mostrar.
 */
export async function persistDailySummaries(
    tx: CycleEngineTransaction,
    facts: CycleEngineFacts,
    historicalCycles: CycleWindow[],
    openCycle: CycleWindow | null,
    prediction: CyclePredictionResult,
): Promise<void> {
    const to = maxDate(facts.today, prediction?.predictedNextStart ?? facts.today);
    const cycles = openCycle ? [...historicalCycles, openCycle] : historicalCycles;

    const rows = projectRange({
        profileId: facts.profileId,
        from: facts.reprojectFrom,
        to,
        updatedAt: new Date().toISOString(),
        cycles,
        prediction,
        checkinsByDate: facts.checkinsByDate,
        intentHistory: facts.intentHistory,
        pregnancyEpisodes: facts.pregnancyEpisodes,
        intercourseDates: facts.intercourseDates,
    });

    for (const row of rows) {
        await tx
            .insert(dailySummary)
            .values(row)
            .onConflictDoUpdate({
                target: [dailySummary.profileId, dailySummary.localDate],
                set: {
                    isMenstruationDay: row.isMenstruationDay,
                    menstruationBasis: row.menstruationBasis,
                    isSpottingDay: row.isSpottingDay,
                    isFertileDay: row.isFertileDay,
                    ovulationConfirmed: row.ovulationConfirmed,
                    isPregnancyDay: row.isPregnancyDay,
                    pregnancyWeek: row.pregnancyWeek,
                    pregnancyTrimester: row.pregnancyTrimester,
                    hadMedication: row.hadMedication,
                    hadIntercourse: row.hadIntercourse,
                    avgMood: row.avgMood,
                    avgEnergy: row.avgEnergy,
                    avgStress: row.avgStress,
                    maxPain: row.maxPain,
                    maxSymptomIntensity: row.maxSymptomIntensity,
                    topSymptomKey: row.topSymptomKey,
                    medicationReliefScore: row.medicationReliefScore,
                    estimatedPhase: row.estimatedPhase,
                    phaseSource: row.phaseSource,
                    phaseConfidence: row.phaseConfidence,
                    cycleDay: row.cycleDay,
                    checkinCount: row.checkinCount,
                    updatedAt: row.updatedAt,
                },
            });
    }
}
