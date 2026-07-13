import { and, eq, isNull } from "drizzle-orm";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { recalculate } from "@/domain/engine/recalculate";

export type DeleteCheckinParams = {
    profileId: string;
    checkinId: string;
};

export type DeleteCheckinResult = { localDate: string };

/**
 * Borrado lógico de un registro y sus hijos (síntomas y medicamentos). El FK
 * `onDelete: cascade` solo aplica al hard delete; para soft delete marcamos
 * `deletedAt` en las tres tablas explícitamente dentro de una transacción.
 * `intercourse_log` queda fuera (no tiene FK al checkin). Tras commitear, el
 * motor recalcula el rango desde la fecha del registro.
 *
 * Lanza error si el registro no existe o ya está borrado.
 */
export async function deleteCheckin(database: Database, params: DeleteCheckinParams): Promise<DeleteCheckinResult> {
    const now = new Date().toISOString();

    const row = await database
        .select({ localDate: checkin.localDate })
        .from(checkin)
        .where(and(eq(checkin.id, params.checkinId), eq(checkin.profileId, params.profileId), isNull(checkin.deletedAt)))
        .limit(1);

    if (row.length === 0) {
        throw new Error(`deleteCheckin: registro ${params.checkinId} no encontrado o ya borrado`);
    }

    const localDate = row.at(0)?.localDate;
    if (!localDate) {
        throw new Error(`deleteCheckin: registro ${params.checkinId} sin localDate`);
    }

    await database.transaction(async (tx) => {
        await tx
            .update(checkin)
            .set({ deletedAt: now, updatedAt: now })
            .where(and(eq(checkin.id, params.checkinId), eq(checkin.profileId, params.profileId)));
        await tx
            .update(checkinSymptom)
            .set({ deletedAt: now, updatedAt: now })
            .where(eq(checkinSymptom.checkinId, params.checkinId));
        await tx
            .update(checkinMedication)
            .set({ deletedAt: now, updatedAt: now })
            .where(eq(checkinMedication.checkinId, params.checkinId));
    });

    await recalculate(database, { profileId: params.profileId, from: localDate });

    return { localDate };
}
