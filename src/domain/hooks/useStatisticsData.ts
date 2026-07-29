import { and, eq, isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { checkin } from "@/db/schema/checkin";
import { dailySummary } from "@/db/schema/dailySummary";
import { useDatabase } from "@/db/useDatabase";

import { useCycleRecords } from "./useCycleRecords";
import { useLocalProfile } from "./useLocalProfile";

export function useStatisticsData() {
    const database = useDatabase();
    const { profile } = useLocalProfile();
    const profileId = profile?.id ?? "";
    const { records } = useCycleRecords(profileId, 12);
    const checkinQuery = useLiveQuery(
        database
            .select()
            .from(checkin)
            .where(and(eq(checkin.profileId, profileId), isNull(checkin.deletedAt)))
            .orderBy(checkin.localDate),
        [profileId],
    );
    const summaryQuery = useLiveQuery(
        database
            .select()
            .from(dailySummary)
            .where(eq(dailySummary.profileId, profileId))
            .orderBy(dailySummary.localDate),
        [profileId],
    );

    return {
        profile,
        cycles: records,
        checkins: checkinQuery.data ?? [],
        summaries: summaryQuery.data ?? [],
    };
}
