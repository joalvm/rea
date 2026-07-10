import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { cycleRecord } from "@/db/schema/cycleRecord";
import { periodRun } from "@/db/schema/periodRun";
import { updatePeriodRun } from "@/features/period/services/updatePeriodRun";
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

describe("Integración de updatePeriodRun", () => {
    it("editar una racha antigua actualiza cycle_records y la predicción", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedPeriodRun(context.database, {
            id: "run-1",
            startDate: "2026-05-01",
            endDate: "2026-05-05",
            status: "closed",
        });
        await seedPeriodRun(context.database, {
            id: "run-2",
            startDate: "2026-05-29",
            endDate: undefined,
            status: "open",
        });

        const result = await updatePeriodRun(db, {
            profileId: profileSeed.id,
            runId: "run-1",
            previousStartDate: "2026-05-01",
            startDate: "2026-04-29",
            endDate: "2026-05-05",
            excluded: false,
        });

        expect(result).toEqual({ ok: true });

        const [run] = await db.select().from(periodRun).where(eq(periodRun.id, "run-1"));
        expect(run?.startDate).toBe("2026-04-29");

        const records = await db.select().from(cycleRecord).where(eq(cycleRecord.profileId, profileSeed.id));
        expect(records).toHaveLength(1);
        expect(records[0]?.startDate).toBe("2026-04-29");
    });

    it("marcar excluded aparta la racha del motor sin borrarla", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedPeriodRun(context.database, {
            id: "run-1",
            startDate: "2026-05-01",
            endDate: "2026-05-05",
            status: "closed",
        });

        const result = await updatePeriodRun(db, {
            profileId: profileSeed.id,
            runId: "run-1",
            previousStartDate: "2026-05-01",
            startDate: "2026-05-01",
            endDate: "2026-05-05",
            excluded: true,
        });

        expect(result).toEqual({ ok: true });

        const [run] = await db.select().from(periodRun).where(eq(periodRun.id, "run-1"));
        expect(run?.status).toBe("excluded");
        expect(run?.deletedAt).toBeNull();
    });

    it("rechaza una corrección que solapa con otra racha, sin tocar la fila original", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedPeriodRun(context.database, {
            id: "run-1",
            startDate: "2026-05-01",
            endDate: "2026-05-05",
            status: "closed",
        });
        await seedPeriodRun(context.database, {
            id: "run-2",
            startDate: "2026-05-10",
            endDate: "2026-05-14",
            status: "closed",
        });

        const result = await updatePeriodRun(db, {
            profileId: profileSeed.id,
            runId: "run-2",
            previousStartDate: "2026-05-10",
            startDate: "2026-05-03",
            endDate: "2026-05-08",
            excluded: false,
        });

        expect(result).toEqual({ ok: false, reason: "overlap" });

        const [run] = await db.select().from(periodRun).where(eq(periodRun.id, "run-2"));
        expect(run?.startDate).toBe("2026-05-10");
        expect(run?.endDate).toBe("2026-05-14");
    });
});
