import { and, eq, isNull, sql } from "drizzle-orm";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { recalculate } from "@/domain/engine/recalculate";

export type SetCheckinExclusionParams = {
    profileId: string;
    checkinId: string;
    /** `true` para excluir el registro de las estadísticas, `false` para volver a incluirlo. */
    excluded: boolean;
};

export type SetCheckinExclusionResult = {
    localDate: string;
    /** `false` si el flag ya tenía el valor pedido (no-op idempotente). */
    changed: boolean;
};

/**
 * Alterna `excludedFromSummary` en un registro. Idempotente: si el flag ya
 * coincide con `excluded`, no escribe ni recalcula y retorna `changed: false`.
 *
 * No es destructivo (el dato se conserva); el mismo toggle lo revierte, así que
 * no requiere confirmación ni snackbar. Tras un cambio efectivo, el motor
 * recalcula el rango desde la fecha del registro.
 *
 * Lanza error si el registro no existe o está borrado.
 */
export async function setCheckinExclusion(
    database: Database,
    params: SetCheckinExclusionParams,
): Promise<SetCheckinExclusionResult> {
    const now = new Date().toISOString();

    const row = await database
        .select({ localDate: checkin.localDate, excludedFromSummary: checkin.excludedFromSummary })
        .from(checkin)
        .where(and(eq(checkin.id, params.checkinId), eq(checkin.profileId, params.profileId), isNull(checkin.deletedAt)))
        .limit(1);

    if (row.length === 0) {
        throw new Error(`setCheckinExclusion: registro ${params.checkinId} no encontrado o borrado`);
    }

    const localDate = row.at(0)?.localDate;
    if (!localDate) {
        throw new Error(`setCheckinExclusion: registro ${params.checkinId} sin localDate`);
    }

    const current = row.at(0)?.excludedFromSummary;
    const isCurrentlyExcluded = current === 1;
    if (isCurrentlyExcluded === params.excluded) {
        return { localDate, changed: false };
    }

    await database.transaction(async (tx) => {
        await tx
            .update(checkin)
            .set({ excludedFromSummary: params.excluded ? 1 : 0, updatedAt: now, version: sql`${checkin.version} + 1` })
            .where(and(eq(checkin.id, params.checkinId), eq(checkin.profileId, params.profileId)));
    });

    await recalculate(database, { profileId: params.profileId, from: localDate });

    return { localDate, changed: true };
}
