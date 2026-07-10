import { and, eq, isNull } from "drizzle-orm";

import type { Database } from "@/db/client";
import type { PeriodRunStatus } from "@/db/enums/periodRun";
import { periodRun } from "@/db/schema/periodRun";
import { recalculate } from "@/domain/engine/recalculate";
import { validatePeriodRunOverlap } from "@/domain/period/validatePeriodRunOverlap";
import type { PeriodRunSnapshot } from "@/domain/period/types/PeriodRunSnapshot";

export type UpdatePeriodRunParams = {
    profileId: string;
    runId: string;
    /** `startDate` original, para saber desde dónde recalcular (puede moverse hacia atrás o adelante). */
    previousStartDate: string;
    startDate: string;
    endDate: string | null;
    excluded: boolean;
};

export type UpdatePeriodRunResult = { ok: true } | { ok: false; reason: "overlap" };

function nextStatus(endDate: string | null, excluded: boolean): PeriodRunStatus {
    if (excluded) return "excluded";
    return endDate === null ? "open" : "closed";
}

/**
 * Corrige fechas o marca `excluded` en una racha existente. Valida solapes contra
 * el resto del historial antes de escribir; el índice `uq_period_runs_single_open`
 * es la última línea de defensa si la corrección reabre una racha.
 */
export async function updatePeriodRun(
    database: Database,
    params: UpdatePeriodRunParams,
): Promise<UpdatePeriodRunResult> {
    const now = new Date().toISOString();

    const rows = await database
        .select()
        .from(periodRun)
        .where(and(eq(periodRun.profileId, params.profileId), isNull(periodRun.deletedAt)));

    const others: PeriodRunSnapshot[] = rows
        .filter((row) => row.id !== params.runId)
        .map((row) => ({ startDate: row.startDate, endDate: row.endDate, status: row.status }));

    const overlap = validatePeriodRunOverlap(others, { startDate: params.startDate, endDate: params.endDate });
    if (overlap.hasOverlap) {
        return { ok: false, reason: "overlap" };
    }

    try {
        await database
            .update(periodRun)
            .set({
                startDate: params.startDate,
                endDate: params.endDate ?? null,
                status: nextStatus(params.endDate, params.excluded),
                updatedAt: now,
            })
            .where(and(eq(periodRun.id, params.runId), eq(periodRun.profileId, params.profileId)));
    } catch {
        return { ok: false, reason: "overlap" };
    }

    const earliestTouchedDate =
        params.previousStartDate < params.startDate ? params.previousStartDate : params.startDate;
    await recalculate(database, { profileId: params.profileId, from: earliestTouchedDate });

    return { ok: true };
}
