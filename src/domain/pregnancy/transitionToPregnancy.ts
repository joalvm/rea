import { and, desc, eq, isNull } from "drizzle-orm";

import type { Database } from "@/db/client";
import type { DatingBasis } from "@/db/enums/pregnancyEpisode";
import { pregnancyEpisode } from "@/db/schema/pregnancyEpisode";
import { periodRun } from "@/db/schema/periodRun";
import { reproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import uuid from "@/db/utils/uuid";
import { recalculateInTransaction } from "@/domain/engine/recalculate";
import { addDaysToISO } from "@/shared/utils/ymd";

const DEFAULT_GESTATION_DAYS = 280;
const DEFAULT_CYCLE_DAYS = 28;

export type TransitionToPregnancyParams = {
    profileId: string;
    effectiveFrom: string;
    lmpDate?: string;
    dueDate?: string | null;
    datingBasis?: DatingBasis;
};

/** Cierra la intención vigente, abre embarazo y recalcula sus proyecciones de forma atómica por perfil. */
export async function transitionToPregnancy(
    database: Database,
    params: TransitionToPregnancyParams,
): Promise<{ episodeId: string; lmpDate: string; dueDate: string }> {
    const now = new Date().toISOString();
    let result: { episodeId: string; lmpDate: string; dueDate: string } | null = null;

    await database.transaction(async (tx) => {
        const openIntent = (
            await tx
                .select()
                .from(reproductiveIntentHistory)
                .where(
                    and(
                        eq(reproductiveIntentHistory.profileId, params.profileId),
                        isNull(reproductiveIntentHistory.effectiveTo),
                        isNull(reproductiveIntentHistory.deletedAt),
                    ),
                )
                .limit(1)
        ).at(0);
        const existingEpisode = (
            await tx
                .select()
                .from(pregnancyEpisode)
                .where(
                    and(
                        eq(pregnancyEpisode.profileId, params.profileId),
                        isNull(pregnancyEpisode.endDate),
                        isNull(pregnancyEpisode.deletedAt),
                    ),
                )
                .limit(1)
        ).at(0);

        if (existingEpisode) {
            result = {
                episodeId: existingEpisode.id,
                lmpDate: existingEpisode.lmpDate,
                dueDate: existingEpisode.dueDate ?? addDaysToISO(existingEpisode.lmpDate, DEFAULT_GESTATION_DAYS),
            };
            return;
        }
        if (!openIntent) {
            throw new Error("No hay una intención reproductiva activa para cambiar a embarazo.");
        }

        const latestPeriod = (
            await tx
                .select({ startDate: periodRun.startDate })
                .from(periodRun)
                .where(and(eq(periodRun.profileId, params.profileId), isNull(periodRun.deletedAt)))
                .orderBy(desc(periodRun.startDate))
                .limit(1)
        ).at(0);
        const lmpDate =
            params.lmpDate ?? latestPeriod?.startDate ?? addDaysToISO(params.effectiveFrom, -DEFAULT_CYCLE_DAYS);
        const dueDate = params.dueDate ?? addDaysToISO(lmpDate, DEFAULT_GESTATION_DAYS);
        const episodeId = uuid();

        await tx
            .update(reproductiveIntentHistory)
            .set({ effectiveTo: params.effectiveFrom, updatedAt: now, version: openIntent.version + 1 })
            .where(eq(reproductiveIntentHistory.id, openIntent.id));
        await tx.insert(reproductiveIntentHistory).values({
            id: uuid(),
            profileId: params.profileId,
            effectiveFrom: params.effectiveFrom,
            reproductiveMode: "pregnancy_tracking",
            regularity: null,
            contraceptionMethod: null,
            declaredCycleLength: null,
            declaredPeriodLength: null,
            breastfeeding: null,
            createdAt: now,
            updatedAt: now,
        });
        await tx.insert(pregnancyEpisode).values({
            id: episodeId,
            profileId: params.profileId,
            lmpDate,
            dueDate,
            datingBasis: params.datingBasis ?? "lmp",
            createdAt: now,
            updatedAt: now,
        });

        result = { episodeId, lmpDate, dueDate };
        await recalculateInTransaction(tx, { profileId: params.profileId, from: params.effectiveFrom });
    });

    if (!result) {
        throw new Error("No se pudo completar la transición a embarazo.");
    }
    return result;
}
