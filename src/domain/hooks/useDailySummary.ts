import { and, eq, gte, lte } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { dailySummary } from "@/db/schema/dailySummary";
import { useDatabase } from "@/db/useDatabase";

/** Filas de `daily_summary` en `[range.from, range.to]` para un perfil, ordenadas por fecha. */
export function useDailySummary(profileId: string, range: { from: string; to: string }) {
    const database = useDatabase();
    const { data, error, updatedAt } = useLiveQuery(
        database
            .select()
            .from(dailySummary)
            .where(
                and(
                    eq(dailySummary.profileId, profileId),
                    gte(dailySummary.localDate, range.from),
                    lte(dailySummary.localDate, range.to),
                ),
            )
            .orderBy(dailySummary.localDate),
        [profileId, range.from, range.to],
    );

    return { summaries: data ?? [], error, updatedAt };
}
