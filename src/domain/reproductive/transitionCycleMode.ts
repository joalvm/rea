import { and, eq, isNull } from "drizzle-orm";

import type { Database } from "@/db/client";
import type { Regularity, ReproductiveMode } from "@/db/enums/reproductiveMode";
import { pregnancyEpisode } from "@/db/schema/pregnancyEpisode";
import type { ReproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import { reproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import uuid from "@/db/utils/uuid";
import { recalculateInTransaction } from "@/domain/engine/recalculate";

export type CycleMode = Exclude<ReproductiveMode, "pregnancy_tracking">;

export type TransitionCycleModeParams = {
    profileId: string;
    effectiveFrom: string;
    targetMode: CycleMode;
    regularity: Regularity;
    declaredCycleLength: number;
    declaredPeriodLength: number;
    contraceptionMethod?: ReproductiveIntentHistory["contraceptionMethod"];
};

/** Cambia entre modos de ciclo conservando datos y versionando la intención activa. */
export async function transitionCycleMode(database: Database, params: TransitionCycleModeParams): Promise<void> {
    const now = new Date().toISOString();

    await database.transaction(async (tx) => {
        const ongoingPregnancy = (
            await tx
                .select({ id: pregnancyEpisode.id })
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
        if (ongoingPregnancy) {
            throw new Error("Cierra el episodio de embarazo antes de volver a un modo de ciclo.");
        }

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
        if (openIntent?.reproductiveMode === params.targetMode) return;

        if (openIntent) {
            await tx
                .update(reproductiveIntentHistory)
                .set({ effectiveTo: params.effectiveFrom, updatedAt: now, version: openIntent.version + 1 })
                .where(eq(reproductiveIntentHistory.id, openIntent.id));
        }

        await tx.insert(reproductiveIntentHistory).values({
            id: uuid(),
            profileId: params.profileId,
            effectiveFrom: params.effectiveFrom,
            reproductiveMode: params.targetMode,
            regularity: params.regularity,
            contraceptionMethod: params.targetMode === "tracking_ttc" ? null : (params.contraceptionMethod ?? null),
            declaredCycleLength: params.declaredCycleLength,
            declaredPeriodLength: params.declaredPeriodLength,
            breastfeeding: null,
            createdAt: now,
            updatedAt: now,
        });
        await recalculateInTransaction(tx, { profileId: params.profileId, from: params.effectiveFrom });
    });
}
