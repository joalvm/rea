import { and, desc, eq, gte, isNull, lte } from "drizzle-orm";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";

export type ListCheckinsParams = {
    profileId: string;
    /** `YYYY-MM-DD` inclusive. */
    from: string;
    /** `YYYY-MM-DD` inclusive. */
    to: string;
};

/**
 * Fila proyectada para la lista del diario: lo mínimo necesario para pintar cada
 * día (sangrado, señal de periodo, nota y exclusión estadística). Síntomas y
 * medicamentos se cargan a demanda en el detalle (`listCheckinsOfDay`).
 */
export type CheckinListItem = {
    id: string;
    recordedAt: string;
    localDate: string;
    bleedingIntensity: number | null;
    periodStatusSignal: string | null;
    note: string | null;
    excludedFromSummary: number;
};

/**
 * Lista los check-ins de un perfil en un rango de fechas locales `[from, to]`
 * (inclusivo), ordenados desc por `recordedAt`. Excluye los soft-deleted
 * (`deletedAt` no nulo). Usa el índice `ix_checkins_date_search`
 * (`profile_id, local_date, deleted_at`), óptimo para filtrar por mes.
 *
 * Es una sola query sobre la tabla `checkins` (sin joins): el diario agrupa por
 * día con `groupByDay` y carga síntomas/medicamentos solo al abrir un día.
 */
export async function listCheckins(
    database: Database,
    params: ListCheckinsParams,
): Promise<CheckinListItem[]> {
    const { profileId, from, to } = params;

    const rows = await database
        .select({
            id: checkin.id,
            recordedAt: checkin.recordedAt,
            localDate: checkin.localDate,
            bleedingIntensity: checkin.bleedingIntensity,
            periodStatusSignal: checkin.periodStatusSignal,
            note: checkin.note,
            excludedFromSummary: checkin.excludedFromSummary,
        })
        .from(checkin)
        .where(
            and(
                eq(checkin.profileId, profileId),
                gte(checkin.localDate, from),
                lte(checkin.localDate, to),
                isNull(checkin.deletedAt),
            ),
        )
        .orderBy(desc(checkin.recordedAt));

    return rows;
}
