import { and, eq } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";

import { dailySummary } from "@/db/schema/dailySummary";
import { useDatabase } from "@/db/useDatabase";

function todayLocalISO(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

/** Resumen diario de hoy para un perfil, reactivo a escrituras en `daily_summary`. */
export function useTodaySummary(profileId: string) {
    const database = useDatabase();
    const today = todayLocalISO();
    const { data, error, updatedAt } = useLiveQuery(
        database
            .select()
            .from(dailySummary)
            .where(and(eq(dailySummary.profileId, profileId), eq(dailySummary.localDate, today))),
        [profileId, today],
    );

    return { summary: data?.at(0) ?? null, error, updatedAt };
}
