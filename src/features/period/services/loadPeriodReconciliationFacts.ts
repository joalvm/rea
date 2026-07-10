import { and, eq, gte, isNull } from "drizzle-orm";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { periodRun } from "@/db/schema/periodRun";
import { reproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import type { ReconcilePeriodStateFacts } from "@/domain/period/reconcilePeriodState";
import { addDaysToISO } from "@/shared/utils/ymd";

/** Ventana de lectura de check-ins para reconciliación: sobra para cualquier umbral de inactividad razonable. */
const LOOKBACK_DAYS = 120;

/**
 * Carga los hechos que necesita `reconcilePeriodState` desde la base de datos.
 * Vive en `features/period` (no en `domain/`) porque hace I/O; el dominio solo
 * recibe hechos ya mapeados.
 */
export async function loadPeriodReconciliationFacts(
    database: Database,
    profileId: string,
    today: string,
): Promise<ReconcilePeriodStateFacts> {
    const periodRunRows = await database
        .select()
        .from(periodRun)
        .where(and(eq(periodRun.profileId, profileId), isNull(periodRun.deletedAt)));

    const checkinRows = await database
        .select()
        .from(checkin)
        .where(
            and(
                eq(checkin.profileId, profileId),
                gte(checkin.localDate, addDaysToISO(today, -LOOKBACK_DAYS)),
                isNull(checkin.deletedAt),
            ),
        );

    const [activeIntent] = await database
        .select({ declaredPeriodLength: reproductiveIntentHistory.declaredPeriodLength })
        .from(reproductiveIntentHistory)
        .where(
            and(
                eq(reproductiveIntentHistory.profileId, profileId),
                isNull(reproductiveIntentHistory.effectiveTo),
                isNull(reproductiveIntentHistory.deletedAt),
            ),
        )
        .limit(1);

    return {
        periodRuns: periodRunRows.map((row) => ({
            startDate: row.startDate,
            endDate: row.endDate,
            status: row.status,
        })),
        checkins: checkinRows.map((row) => ({
            localDate: row.localDate,
            bleedingIntensity: row.bleedingIntensity,
            periodStatusSignal: row.periodStatusSignal,
        })),
        declaredPeriodLength: activeIntent?.declaredPeriodLength ?? null,
    };
}
