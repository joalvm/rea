import { and, eq, gte, isNull } from "drizzle-orm";
import { useLiveQuery } from "drizzle-orm/expo-sqlite";
import { useMemo } from "react";

import { checkin } from "@/db/schema/checkin";
import { periodRun, type PeriodRun } from "@/db/schema/periodRun";
import { reproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import { useDatabase } from "@/db/useDatabase";
import { reconcilePeriodState } from "@/domain/period/reconcilePeriodState";
import type { ReconciliationAction } from "@/domain/period/types/ReconciliationAction";
import { addDaysToISO, todayYMD, ymdToISO } from "@/shared/utils/ymd";

const LOOKBACK_DAYS = 120;

export type PeriodProposal = {
    action: ReconciliationAction;
    /** Racha abierta vigente, si existe (necesaria para `closePeriodRun`). */
    openRun: PeriodRun | null;
    /** Racha cerrada candidata a fusión, resuelta cuando `action.type === "proponer_fusión"`. */
    mergeCandidateRun: PeriodRun | null;
    today: string;
};

/** Propuesta de reconciliación vigente para un perfil, recalculada en vivo sobre `period_runs` y `checkins`. */
export function usePeriodProposal(profileId: string): PeriodProposal {
    const database = useDatabase();
    const today = ymdToISO(todayYMD());
    const since = addDaysToISO(today, -LOOKBACK_DAYS);

    const { data: periodRuns } = useLiveQuery(
        database
            .select()
            .from(periodRun)
            .where(and(eq(periodRun.profileId, profileId), isNull(periodRun.deletedAt))),
        [profileId],
    );

    const { data: checkins } = useLiveQuery(
        database
            .select()
            .from(checkin)
            .where(and(eq(checkin.profileId, profileId), gte(checkin.localDate, since), isNull(checkin.deletedAt))),
        [profileId, since],
    );

    const { data: intents } = useLiveQuery(
        database
            .select({ declaredPeriodLength: reproductiveIntentHistory.declaredPeriodLength })
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

    return useMemo(() => {
        const runs = periodRuns ?? [];
        const action = reconcilePeriodState(
            {
                periodRuns: runs.map((row) => ({ startDate: row.startDate, endDate: row.endDate, status: row.status })),
                checkins: (checkins ?? []).map((row) => ({
                    localDate: row.localDate,
                    bleedingIntensity: row.bleedingIntensity,
                    periodStatusSignal: row.periodStatusSignal,
                })),
                declaredPeriodLength: intents?.at(0)?.declaredPeriodLength ?? null,
            },
            today,
        );

        const openRun = runs.find((row) => row.status === "open") ?? null;
        const mergeCandidateRun =
            action.type === "proponer_fusión"
                ? (runs.find((row) => row.status === "closed" && row.endDate === action.closedRunEndDate) ?? null)
                : null;

        return { action, openRun, mergeCandidateRun, today };
    }, [periodRuns, checkins, intents, today]);
}
