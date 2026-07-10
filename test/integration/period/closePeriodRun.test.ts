import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { cycleRecord } from "@/db/schema/cycleRecord";
import { periodRun } from "@/db/schema/periodRun";
import { reconcilePeriodState } from "@/domain/period/reconcilePeriodState";
import { closePeriodRun } from "@/features/period/services/closePeriodRun";
import { loadPeriodReconciliationFacts } from "@/features/period/services/loadPeriodReconciliationFacts";
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

describe("Integración de closePeriodRun", () => {
    it("el prompt de inactividad cierra con end_date del último sangrado real (spotting de cola excluido)", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database, { declaredPeriodLength: 5 });
        await seedPeriodRun(context.database, {
            id: "run-1",
            startDate: "2026-06-01",
            endDate: undefined,
            status: "open",
        });
        await seedCheckin(context.database, { id: "c1", localDate: "2026-06-01", bleedingIntensity: 3 });
        await seedCheckin(context.database, { id: "c2", localDate: "2026-06-02", bleedingIntensity: 3 });
        await seedCheckin(context.database, { id: "c3", localDate: "2026-06-03", bleedingIntensity: 2 });
        // Manchado de cola tras el sangrado real: nunca debe mover la fecha de cierre.
        await seedCheckin(context.database, { id: "c4", localDate: "2026-06-04", bleedingIntensity: 1 });

        const today = "2026-06-11"; // 8 días desde el último sangrado real (06-03): 5 (declarado) + 3
        const facts = await loadPeriodReconciliationFacts(db, profileSeed.id, today);
        const action = reconcilePeriodState(facts, today);

        expect(action).toEqual({ type: "proponer_cierre", endDate: "2026-06-03", reason: "inactivity_prompt" });

        if (action.type !== "proponer_cierre") throw new Error("acción inesperada");
        await closePeriodRun(db, {
            profileId: profileSeed.id,
            runId: "run-1",
            runStartDate: "2026-06-01",
            endDate: action.endDate,
        });

        const [run] = await db.select().from(periodRun).where(eq(periodRun.id, "run-1"));
        expect(run?.status).toBe("closed");
        expect(run?.endDate).toBe("2026-06-03");

        // recalculate corrió: al no haber ciclo anterior con el que compararlo, el motor
        // aún no puede cerrar un cycle_record (necesita el inicio del ciclo siguiente).
        const records = await db.select().from(cycleRecord).where(eq(cycleRecord.profileId, profileSeed.id));
        expect(records).toHaveLength(0);
    });

    it("cierre por señal 'terminó' usa también el último día de sangrado real, no la fecha de la señal", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database, { declaredPeriodLength: 5 });
        await seedPeriodRun(context.database, {
            id: "run-1",
            startDate: "2026-06-01",
            endDate: undefined,
            status: "open",
        });
        await seedCheckin(context.database, { id: "c1", localDate: "2026-06-01", bleedingIntensity: 3 });
        await seedCheckin(context.database, { id: "c2", localDate: "2026-06-02", bleedingIntensity: 2 });
        await seedCheckin(context.database, {
            id: "c3",
            localDate: "2026-06-03",
            bleedingIntensity: 1,
            periodStatusSignal: "ended",
        });

        const today = "2026-06-03";
        const facts = await loadPeriodReconciliationFacts(db, profileSeed.id, today);
        const action = reconcilePeriodState(facts, today);

        expect(action).toEqual({ type: "proponer_cierre", endDate: "2026-06-02", reason: "signal_ended" });
    });
});
