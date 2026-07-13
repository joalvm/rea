import { and, desc, eq, gte, isNull, lte } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { checkin } from "@/db/schema/checkin";
import { useDatabase } from "@/db/useDatabase";

import type { CheckinListItem } from "../services/listCheckins";

/**
 * Lectura reactiva de los check-ins de un perfil en un rango de fechas locales
 * `[range.from, range.to]` (inclusivo), ordenados desc por `recordedAt` y sin
 * soft-deleted. Sigue el patrón canónico de `useDailySummary` (una sola query +
 * `useLiveQuery`), por lo que la lista se actualiza en vivo al crear/borrar
 * check-ins en el rango.
 *
 * Si `profileId` es nulo/undefined (onboarding incompleto) se usa un sentinel de
 * cadena vacía que no coincide con ningún perfil, devolviendo `items: []`. Así se
 * respeta el contrato de hooks (siempre se llama a `useLiveQuery`).
 */
export function useCheckins(profileId: string | null | undefined, range: { from: string; to: string }) {
    const database = useDatabase();
    const effectiveId = profileId ?? "";

    const { data, error, updatedAt } = useLiveQuery(
        database
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
                    eq(checkin.profileId, effectiveId),
                    gte(checkin.localDate, range.from),
                    lte(checkin.localDate, range.to),
                    isNull(checkin.deletedAt),
                ),
            )
            .orderBy(desc(checkin.recordedAt)),
        [effectiveId, range.from, range.to],
    );

    return { items: (data ?? []) as CheckinListItem[], error, updatedAt };
}
