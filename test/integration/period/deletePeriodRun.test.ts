import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { eq, isNull } from "drizzle-orm";

import type { Database } from "@/db/client";
import { periodRun } from "@/db/schema/periodRun";
import { deletePeriodRun } from "@/features/period/services/deletePeriodRun";
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

describe("Integración de deletePeriodRun", () => {
    it("borra lógicamente la racha (deletedAt) sin quitar la fila, y el motor deja de verla", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedPeriodRun(context.database, {
            id: "run-1",
            startDate: "2026-05-01",
            endDate: "2026-05-05",
            status: "closed",
        });

        await deletePeriodRun(db, { profileId: profileSeed.id, runId: "run-1", runStartDate: "2026-05-01" });

        const [run] = await db.select().from(periodRun).where(eq(periodRun.id, "run-1"));
        expect(run).toBeDefined();
        expect(run?.deletedAt).not.toBeNull();

        const visibleRuns = await db.select().from(periodRun).where(isNull(periodRun.deletedAt));
        expect(visibleRuns).toHaveLength(0);
    });
});
