import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { periodRun } from "@/db/schema/periodRun";
import { reconcilePeriodState } from "@/domain/period/reconcilePeriodState";
import { loadPeriodReconciliationFacts } from "@/features/period/services/loadPeriodReconciliationFacts";
import { mergePeriodRuns } from "@/features/period/services/mergePeriodRuns";
import { startPeriodRun } from "@/features/period/services/startPeriodRun";
import { seedCheckin } from "@test/integration/db/seeders/checkinSeeder";
import { seedPeriodRun } from "@test/integration/db/seeders/periodRunSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { seedReproductiveIntentHistory } from "@test/integration/db/seeders/reproductiveIntentHistorySeeder";
import { type FileDatabase, createFileDatabase } from "@test/utils/createFileDatabase";

let database: FileDatabase | null = null;

beforeEach(async () => {
    database = await createFileDatabase();
});
afterEach(() => {
    database?.close();
    database = null;
});

const context = {
    get database() {
        if (database == null) {
            throw new Error("se accedió a la base de datos de archivo antes de inicializarla");
        }
        return database;
    },
};

describe("Integración de mergePeriodRuns", () => {
    it("un nuevo sangrado a menos de 3 días de un cierre propone y aplica la fusión: reabre la racha cerrada", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedPeriodRun(context.database, {
            id: "run-1",
            startDate: "2026-06-01",
            endDate: "2026-06-05",
            status: "closed",
        });
        await seedCheckin(context.database, { id: "c1", localDate: "2026-06-07", bleedingIntensity: 3 });

        const today = "2026-06-07";
        const facts = await loadPeriodReconciliationFacts(db, profileSeed.id, today);
        const action = reconcilePeriodState(facts, today);

        expect(action).toEqual({
            type: "proponer_fusión",
            closedRunEndDate: "2026-06-05",
            newStartDate: "2026-06-07",
            gapDays: 2,
        });

        await mergePeriodRuns(db, { profileId: profileSeed.id, runId: "run-1", runStartDate: "2026-06-01" });

        const [run] = await db.select().from(periodRun).where(eq(periodRun.id, "run-1"));
        expect(run?.status).toBe("open");
        expect(run?.endDate).toBeNull();

        // Sin segunda fila: fusionar no crea una racha nueva, reabre la existente.
        const runs = await db.select().from(periodRun).where(eq(periodRun.profileId, profileSeed.id));
        expect(runs).toHaveLength(1);
    });

    it("declinar la fusión abre una racha nueva independiente, sin tocar la cerrada", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedPeriodRun(context.database, {
            id: "run-1",
            startDate: "2026-06-01",
            endDate: "2026-06-05",
            status: "closed",
        });

        await startPeriodRun(db, {
            profileId: profileSeed.id,
            startDate: "2026-06-07",
            status: "open",
            source: "bleeding_inferred",
        });

        const runs = await db.select().from(periodRun).where(eq(periodRun.profileId, profileSeed.id));
        expect(runs).toHaveLength(2);
        expect(runs.find((run) => run.id === "run-1")?.status).toBe("closed");
        expect(runs.find((run) => run.startDate === "2026-06-07")?.status).toBe("open");
    });
});
