import { eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { periodRun } from "@/db/schema/periodRun";
import { useDatabase } from "@/db/useDatabase";

/** Una racha puntual por id, para la pantalla de edición. */
export function usePeriodRunById(runId: string) {
    const database = useDatabase();
    const { data, error, updatedAt } = useLiveQuery(
        database.select().from(periodRun).where(eq(periodRun.id, runId)).limit(1),
        [runId],
    );

    return { run: data?.at(0) ?? null, error, updatedAt };
}
