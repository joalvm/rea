import { and, eq, isNotNull } from "drizzle-orm";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { recalculate } from "@/domain/engine/recalculate";

export type RestoreCheckinParams = {
    profileId: string;
    checkinId: string;
};

export type RestoreCheckinResult = { localDate: string };

/**
 * Revierte el borrado lógico de un registro y sus hijos. Restaura solo lo que el
 * borrado marcó (filas con `deletedAt` no nulo), de forma defensiva: si otra
 * mutación tocó los hijos mientras tanto, no los revive. Tras commitear, el
 * motor recalcula el rango desde la fecha del registro.
 *
 * Lanza error si el registro no existe o no estaba borrado.
 */
export async function restoreCheckin(database: Database, params: RestoreCheckinParams): Promise<RestoreCheckinResult> {
    const row = await database
        .select({ localDate: checkin.localDate })
        .from(checkin)
        .where(and(eq(checkin.id, params.checkinId), eq(checkin.profileId, params.profileId)))
        .limit(1);

    if (row.length === 0) {
        throw new Error(`restoreCheckin: registro ${params.checkinId} no encontrado`);
    }

    const localDate = row.at(0)?.localDate;
    if (!localDate) {
        throw new Error(`restoreCheckin: registro ${params.checkinId} sin localDate`);
    }

    await database.transaction(async (tx) => {
        await tx
            .update(checkin)
            .set({ deletedAt: null })
            .where(
                and(
                    eq(checkin.id, params.checkinId),
                    eq(checkin.profileId, params.profileId),
                    isNotNull(checkin.deletedAt),
                ),
            );
        await tx
            .update(checkinSymptom)
            .set({ deletedAt: null })
            .where(and(eq(checkinSymptom.checkinId, params.checkinId), isNotNull(checkinSymptom.deletedAt)));
        await tx
            .update(checkinMedication)
            .set({ deletedAt: null })
            .where(and(eq(checkinMedication.checkinId, params.checkinId), isNotNull(checkinMedication.deletedAt)));
    });

    await recalculate(database, { profileId: params.profileId, from: localDate });

    return { localDate };
}
