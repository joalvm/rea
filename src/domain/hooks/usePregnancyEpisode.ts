import { and, asc, eq, isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { pregnancyEpisode } from "@/db/schema/pregnancyEpisode";
import { useDatabase } from "@/db/useDatabase";

/** Episodio de embarazo abierto del perfil local, reactivo a transiciones y cierres. */
export function usePregnancyEpisode(profileId: string) {
    const database = useDatabase();
    const { data, error, updatedAt } = useLiveQuery(
        database
            .select()
            .from(pregnancyEpisode)
            .where(
                and(
                    eq(pregnancyEpisode.profileId, profileId),
                    isNull(pregnancyEpisode.endDate),
                    isNull(pregnancyEpisode.deletedAt),
                ),
            )
            .orderBy(asc(pregnancyEpisode.lmpDate))
            .limit(1),
        [profileId],
    );

    return { episode: data?.at(0) ?? null, error, updatedAt };
}
