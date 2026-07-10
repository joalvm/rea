import { and, eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { periodRun } from "@/db/schema/periodRun";
import { recalculate } from "@/domain/engine/recalculate";

export type DeletePeriodRunParams = {
    profileId: string;
    runId: string;
    runStartDate: string;
};

/** Borrado lógico de una racha; el historial la deja de ver, el motor recalcula sin ella. */
export async function deletePeriodRun(database: Database, params: DeletePeriodRunParams): Promise<void> {
    const now = new Date().toISOString();

    await database
        .update(periodRun)
        .set({ deletedAt: now, updatedAt: now })
        .where(and(eq(periodRun.id, params.runId), eq(periodRun.profileId, params.profileId)));

    await recalculate(database, { profileId: params.profileId, from: params.runStartDate });
}
