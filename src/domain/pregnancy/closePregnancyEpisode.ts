import { and, eq, isNull } from "drizzle-orm";

import type { Database } from "@/db/client";
import type { PregnancyOutcome } from "@/db/enums/pregnancyEpisode";
import { pregnancyEpisode } from "@/db/schema/pregnancyEpisode";
import { reproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import { recalculateInTransaction } from "@/domain/engine/recalculate";

export type ClosePregnancyEpisodeParams = {
    profileId: string;
    episodeId: string;
    endDate: string;
    outcome: PregnancyOutcome;
    outcomeDetails?: string | null;
};

/** Cierra episodio e intención en una sola mutación; deja el perfil neutro hasta que elija otro modo. */
export async function closePregnancyEpisode(database: Database, params: ClosePregnancyEpisodeParams): Promise<void> {
    const now = new Date().toISOString();

    await database.transaction(async (tx) => {
        await tx
            .update(pregnancyEpisode)
            .set({
                endDate: params.endDate,
                outcome: params.outcome,
                outcomeDetails: params.outcomeDetails ?? null,
                updatedAt: now,
                version: 2,
            })
            .where(
                and(
                    eq(pregnancyEpisode.id, params.episodeId),
                    eq(pregnancyEpisode.profileId, params.profileId),
                    isNull(pregnancyEpisode.endDate),
                    isNull(pregnancyEpisode.deletedAt),
                ),
            );
        await tx
            .update(reproductiveIntentHistory)
            .set({ effectiveTo: params.endDate, updatedAt: now })
            .where(
                and(
                    eq(reproductiveIntentHistory.profileId, params.profileId),
                    eq(reproductiveIntentHistory.reproductiveMode, "pregnancy_tracking"),
                    isNull(reproductiveIntentHistory.effectiveTo),
                    isNull(reproductiveIntentHistory.deletedAt),
                ),
            );
        await recalculateInTransaction(tx, { profileId: params.profileId, from: params.endDate });
    });
}
