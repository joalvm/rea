import { and, desc, eq, isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { periodRun } from "@/db/schema/periodRun";
import { useDatabase } from "@/db/useDatabase";

/** Historial completo de rachas de un perfil, más reciente primero. */
export function usePeriodRuns(profileId: string) {
    const database = useDatabase();
    const { data, error, updatedAt } = useLiveQuery(
        database
            .select()
            .from(periodRun)
            .where(and(eq(periodRun.profileId, profileId), isNull(periodRun.deletedAt)))
            .orderBy(desc(periodRun.startDate)),
        [profileId],
    );

    return { runs: data ?? [], error, updatedAt };
}
