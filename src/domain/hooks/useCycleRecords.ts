import { desc, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { cycleRecord } from "@/db/schema/cycleRecord";
import { useDatabase } from "@/db/useDatabase";

/** Últimos `limit` ciclos cerrados de un perfil, más reciente primero. */
export function useCycleRecords(profileId: string, limit: number) {
    const database = useDatabase();
    const { data, error, updatedAt } = useLiveQuery(
        database
            .select()
            .from(cycleRecord)
            .where(eq(cycleRecord.profileId, profileId))
            .orderBy(desc(cycleRecord.startDate))
            .limit(limit),
        [profileId, limit],
    );

    return { records: data ?? [], error, updatedAt };
}
