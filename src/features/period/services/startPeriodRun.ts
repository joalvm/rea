import type { Database } from "@/db/client";
import type { PeriodRunSource, PeriodRunStatus } from "@/db/enums/periodRun";
import { periodRun } from "@/db/schema/periodRun";
import uuid from "@/db/utils/uuid";
import { recalculate } from "@/domain/engine/recalculate";

export type StartPeriodRunParams = {
    profileId: string;
    startDate: string;
    endDate?: string | null;
    status: PeriodRunStatus;
    source: PeriodRunSource;
};

/** Abre (o registra, si ya nace cerrada/excluida) una racha de periodo y recalcula el motor desde su inicio. */
export async function startPeriodRun(database: Database, params: StartPeriodRunParams): Promise<string> {
    const now = new Date().toISOString();
    const id = uuid();

    await database.insert(periodRun).values({
        id,
        profileId: params.profileId,
        startDate: params.startDate,
        endDate: params.endDate ?? undefined,
        status: params.status,
        source: params.source,
        createdAt: now,
        updatedAt: now,
    });

    await recalculate(database, { profileId: params.profileId, from: params.startDate });

    return id;
}
