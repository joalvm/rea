import { and, eq, isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { reproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import { useDatabase } from "@/db/useDatabase";

/** Intención reproductiva vigente de un perfil (`effectiveTo IS NULL`, no borrada). */
export function useActiveIntent(profileId: string) {
    const database = useDatabase();
    const { data, error, updatedAt } = useLiveQuery(
        database
            .select()
            .from(reproductiveIntentHistory)
            .where(
                and(
                    eq(reproductiveIntentHistory.profileId, profileId),
                    isNull(reproductiveIntentHistory.effectiveTo),
                    isNull(reproductiveIntentHistory.deletedAt),
                ),
            )
            .limit(1),
        [profileId],
    );

    return { intent: data?.at(0) ?? null, error, updatedAt };
}
