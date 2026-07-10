import { and, eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { periodRun } from "@/db/schema/periodRun";
import { recalculate } from "@/domain/engine/recalculate";

export type MergePeriodRunsParams = {
    profileId: string;
    /** Racha cerrada que se reabre para absorber el nuevo sangrado ("fue la misma regla"). */
    runId: string;
    runStartDate: string;
};

/** Reabre una racha cerrada recientemente (fusión) en vez de crear una segunda fila para el mismo episodio. */
export async function mergePeriodRuns(database: Database, params: MergePeriodRunsParams): Promise<void> {
    const now = new Date().toISOString();

    await database
        .update(periodRun)
        .set({ status: "open", endDate: null, updatedAt: now })
        .where(and(eq(periodRun.id, params.runId), eq(periodRun.profileId, params.profileId)));

    await recalculate(database, { profileId: params.profileId, from: params.runStartDate });
}
