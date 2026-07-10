import { and, eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { periodRun } from "@/db/schema/periodRun";
import { recalculate } from "@/domain/engine/recalculate";

export type ClosePeriodRunParams = {
    profileId: string;
    runId: string;
    /** `startDate` de la racha, ya conocido por quien llama (evita una lectura extra). */
    runStartDate: string;
    endDate: string;
};

/** Cierra una racha abierta (último día de sangrado real) y recalcula el motor desde su inicio. */
export async function closePeriodRun(database: Database, params: ClosePeriodRunParams): Promise<void> {
    const now = new Date().toISOString();

    await database
        .update(periodRun)
        .set({ endDate: params.endDate, status: "closed", updatedAt: now })
        .where(and(eq(periodRun.id, params.runId), eq(periodRun.profileId, params.profileId)));

    await recalculate(database, { profileId: params.profileId, from: params.runStartDate });
}
