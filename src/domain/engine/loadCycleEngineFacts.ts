import { and, eq, gte, inArray, isNull, lte } from "drizzle-orm";

import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { cycleRecord } from "@/db/schema/cycleRecord";
import { intercourseLog } from "@/db/schema/intercourseLog";
import { periodRun } from "@/db/schema/periodRun";
import { pregnancyEpisode } from "@/db/schema/pregnancyEpisode";
import { reproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import { symptomCatalog } from "@/db/schema/symptomCatalog";
import { deriveCycles } from "@/domain/cycle/deriveCycles";
import type { CheckinFact } from "@/domain/cycle/types/CheckinFact";
import type { CycleWindow } from "@/domain/cycle/types/CycleWindow";
import type { PeriodRunFact } from "@/domain/cycle/types/PeriodRunFact";
import type { ReproductiveIntentFact } from "@/domain/cycle/types/ReproductiveIntentFact";
import { findActiveIntent } from "@/domain/projection/projectRange";
import type { CheckinProjectionFact } from "@/domain/projection/types/CheckinProjectionFact";
import type { PregnancyEpisodeFact } from "@/domain/projection/types/PregnancyEpisodeFact";

import type { ChangedRange } from "./types/ChangedRange";
import type { CycleEngineTransaction } from "./types/CycleEngineTransaction";

export type CycleEngineFacts = {
    profileId: string;
    today: string;
    reprojectFrom: string;
    periodRuns: PeriodRunFact[];
    derivedCycles: CycleWindow[];
    historicalCyclesBeforeReprojectStart: CycleWindow[];
    intentHistory: ReproductiveIntentFact[];
    activeIntentToday: ReproductiveIntentFact | null;
    pregnancyEpisodes: PregnancyEpisodeFact[];
    checkinsInRange: CheckinFact[];
    checkinsByDate: Record<string, CheckinProjectionFact[]>;
    intercourseDates: Set<string>;
    isPaused: boolean;
    hasPostpartumAnchor: boolean;
};

function todayLocalISO(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function isWithinRange(date: string, start: string, end: string | null): boolean {
    return date >= start && (end === null || date <= end);
}

/**
 * Carga y arma todos los hechos que necesita `recalculate` para un profileId,
 * acotando check-ins/relaciones al rango `[reprojectFrom, today]` — no se pueden
 * registrar check-ins a futuro, así que ese es el techo natural para hechos
 * observados. `persistDailySummaries` decide, ya con la predicción en mano, hasta
 * qué fecha futura proyectar `daily_summary`.
 */
export async function loadCycleEngineFacts(
    tx: CycleEngineTransaction,
    changedRange: ChangedRange,
): Promise<CycleEngineFacts> {
    const { profileId } = changedRange;
    const today = todayLocalISO();

    const periodRunRows = await tx
        .select()
        .from(periodRun)
        .where(and(eq(periodRun.profileId, profileId), isNull(periodRun.deletedAt)));
    const periodRuns: PeriodRunFact[] = periodRunRows.map((row) => ({
        startDate: row.startDate,
        endDate: row.endDate,
        status: row.status,
    }));

    const intentRows = await tx
        .select()
        .from(reproductiveIntentHistory)
        .where(and(eq(reproductiveIntentHistory.profileId, profileId), isNull(reproductiveIntentHistory.deletedAt)));
    const intentHistory: ReproductiveIntentFact[] = intentRows.map((row) => ({
        effectiveFrom: row.effectiveFrom,
        effectiveTo: row.effectiveTo,
        reproductiveMode: row.reproductiveMode,
        contraceptionMethod: row.contraceptionMethod,
        breastfeeding: row.breastfeeding,
        declaredCycleLength: row.declaredCycleLength,
        declaredPeriodLength: row.declaredPeriodLength,
    }));

    const pregnancyRows = await tx
        .select()
        .from(pregnancyEpisode)
        .where(and(eq(pregnancyEpisode.profileId, profileId), isNull(pregnancyEpisode.deletedAt)));
    const pregnancyEpisodes: PregnancyEpisodeFact[] = pregnancyRows.map((row) => ({
        startDate: row.lmpDate,
        endDate: row.endDate,
    }));

    const cycleRecordRows = await tx
        .select()
        .from(cycleRecord)
        .where(eq(cycleRecord.profileId, profileId))
        .orderBy(cycleRecord.startDate);
    const persistedCycles: CycleWindow[] = cycleRecordRows.map((row) => ({
        startDate: row.startDate,
        endDate: row.endDate,
        periodLength: row.periodLength,
        cycleLength: row.cycleLength,
        isValid: row.isValid,
        excludedReason: row.excludedReason,
        ovulationDate: row.ovulationDate,
        ovulationBasis: row.ovulationBasis,
        lutealLength: row.lutealLength,
    }));

    const derivedCycles = deriveCycles(periodRuns);
    const changedCycle = derivedCycles.find((cycle) =>
        isWithinRange(changedRange.from, cycle.startDate, cycle.endDate),
    );
    const reprojectFrom = changedCycle?.startDate ?? changedRange.from;
    const historicalCyclesBeforeReprojectStart = persistedCycles.filter((cycle) => cycle.startDate < reprojectFrom);

    const checkinRows = await tx
        .select()
        .from(checkin)
        .where(
            and(
                eq(checkin.profileId, profileId),
                gte(checkin.localDate, reprojectFrom),
                lte(checkin.localDate, today),
                isNull(checkin.deletedAt),
            ),
        );
    const checkinIds = checkinRows.map((row) => row.id);

    const symptomRows =
        checkinIds.length > 0
            ? await tx
                  .select({
                      checkinId: checkinSymptom.checkinId,
                      symptomKey: checkinSymptom.symptomKey,
                      intensity: checkinSymptom.intensity,
                      uiPriority: symptomCatalog.uiPriority,
                  })
                  .from(checkinSymptom)
                  .innerJoin(symptomCatalog, eq(checkinSymptom.symptomKey, symptomCatalog.symptomKey))
                  .where(and(inArray(checkinSymptom.checkinId, checkinIds), isNull(checkinSymptom.deletedAt)))
            : [];

    const medicationRows =
        checkinIds.length > 0
            ? await tx
                  .select({ checkinId: checkinMedication.checkinId, relief: checkinMedication.relief })
                  .from(checkinMedication)
                  .where(and(inArray(checkinMedication.checkinId, checkinIds), isNull(checkinMedication.deletedAt)))
            : [];

    const symptomsByCheckinId = new Map<string, { symptomKey: string; intensity: number; uiPriority: number }[]>();
    for (const row of symptomRows) {
        const entries = symptomsByCheckinId.get(row.checkinId) ?? [];
        entries.push({ symptomKey: row.symptomKey, intensity: row.intensity, uiPriority: row.uiPriority });
        symptomsByCheckinId.set(row.checkinId, entries);
    }

    const medicationsByCheckinId = new Map<string, { relief: number | null }[]>();
    for (const row of medicationRows) {
        const entries = medicationsByCheckinId.get(row.checkinId) ?? [];
        entries.push({ relief: row.relief });
        medicationsByCheckinId.set(row.checkinId, entries);
    }

    const checkinsInRange: CheckinFact[] = checkinRows.map((row) => ({
        localDate: row.localDate,
        basalBodyTempC: row.basalBodyTempC,
        opkResult: row.opkResult,
        cervicalMucus: row.cervicalMucus,
    }));

    const checkinsByDate: Record<string, CheckinProjectionFact[]> = {};
    for (const row of checkinRows) {
        const projectionFact: CheckinProjectionFact = {
            localDate: row.localDate,
            basalBodyTempC: row.basalBodyTempC,
            opkResult: row.opkResult,
            cervicalMucus: row.cervicalMucus,
            bleedingIntensity: row.bleedingIntensity,
            periodStatusSignal: row.periodStatusSignal,
            mood: row.mood,
            energy: row.energy,
            stressLevel: row.stressLevel,
            painIntensity: row.painIntensity,
            excludedFromSummary: row.excludedFromSummary === 1,
            symptoms: symptomsByCheckinId.get(row.id) ?? [],
            medications: medicationsByCheckinId.get(row.id) ?? [],
        };
        const dayEntries = checkinsByDate[row.localDate] ?? [];
        dayEntries.push(projectionFact);
        checkinsByDate[row.localDate] = dayEntries;
    }

    const intercourseRows = await tx
        .select({ localDate: intercourseLog.localDate })
        .from(intercourseLog)
        .where(
            and(
                eq(intercourseLog.profileId, profileId),
                gte(intercourseLog.localDate, reprojectFrom),
                lte(intercourseLog.localDate, today),
                isNull(intercourseLog.deletedAt),
            ),
        );
    const intercourseDates = new Set(intercourseRows.map((row) => row.localDate));

    const activeIntentToday = findActiveIntent(intentHistory, today);
    const isPaused =
        activeIntentToday?.reproductiveMode === "pregnancy_tracking" ||
        pregnancyEpisodes.some((episode) => episode.endDate === null && episode.startDate <= today);

    const mostRecentlyClosedEpisode = pregnancyEpisodes
        .filter((episode) => episode.endDate !== null)
        .sort((a, b) => ((b.endDate as string) > (a.endDate as string) ? 1 : -1))
        .at(0);
    const hasPostpartumAnchor =
        mostRecentlyClosedEpisode === undefined ||
        periodRuns.some((run) => run.startDate > (mostRecentlyClosedEpisode.endDate as string));

    return {
        profileId,
        today,
        reprojectFrom,
        periodRuns,
        derivedCycles,
        historicalCyclesBeforeReprojectStart,
        intentHistory,
        activeIntentToday,
        pregnancyEpisodes,
        checkinsInRange,
        checkinsByDate,
        intercourseDates,
        isPaused,
        hasPostpartumAnchor,
    };
}
