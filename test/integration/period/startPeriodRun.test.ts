import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { cycleRecord } from "@/db/schema/cycleRecord";
import { periodRun } from "@/db/schema/periodRun";
import { reconcilePeriodState } from "@/domain/period/reconcilePeriodState";
import { loadPeriodReconciliationFacts } from "@/features/period/services/loadPeriodReconciliationFacts";
import { startPeriodRun } from "@/features/period/services/startPeriodRun";
import { seedCheckin } from "@test/integration/db/seeders/checkinSeeder";
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

describe("Integración de startPeriodRun", () => {
    it("señal directa (check-in / CTA) abre racha con source user_confirmed", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        await startPeriodRun(db, {
            profileId: profileSeed.id,
            startDate: "2026-06-04",
            status: "open",
            source: "user_confirmed",
        });

        const runs = await db.select().from(periodRun).where(eq(periodRun.profileId, profileSeed.id));
        expect(runs).toHaveLength(1);
        expect(runs[0]?.status).toBe("open");
        expect(runs[0]?.source).toBe("user_confirmed");
        expect(runs[0]?.startDate).toBe("2026-06-04");
    });

    it("sangrado inferido genera propuesta y confirmarla abre racha con source bleeding_inferred", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedCheckin(context.database, { id: "c1", localDate: "2026-06-04", bleedingIntensity: 3 });
        await seedCheckin(context.database, { id: "c2", localDate: "2026-06-05", bleedingIntensity: 3 });

        const today = "2026-06-05";
        const facts = await loadPeriodReconciliationFacts(db, profileSeed.id, today);
        const action = reconcilePeriodState(facts, today);

        expect(action).toEqual({ type: "proponer_inicio", startDate: "2026-06-04", source: "bleeding_inferred" });

        if (action.type !== "proponer_inicio") throw new Error("acción inesperada");
        await startPeriodRun(db, {
            profileId: profileSeed.id,
            startDate: action.startDate,
            status: "open",
            source: action.source,
        });

        const runs = await db.select().from(periodRun).where(eq(periodRun.profileId, profileSeed.id));
        expect(runs).toHaveLength(1);
        expect(runs[0]?.source).toBe("bleeding_inferred");
        expect(runs[0]?.status).toBe("open");

        // recalculate corrió sin lanzar: el motor tiene un ciclo abierto que refleja la racha.
        const records = await db.select().from(cycleRecord).where(eq(cycleRecord.profileId, profileSeed.id));
        expect(records).toHaveLength(0); // ciclo aún abierto, no cierra hasta que exista uno siguiente
    });

    it("'fue solo manchado' registra una racha excluida de un día, sin abrir racha activa", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        await startPeriodRun(db, {
            profileId: profileSeed.id,
            startDate: "2026-06-04",
            endDate: "2026-06-04",
            status: "excluded",
            source: "user_confirmed",
        });

        const runs = await db.select().from(periodRun).where(eq(periodRun.profileId, profileSeed.id));
        expect(runs).toHaveLength(1);
        expect(runs[0]?.status).toBe("excluded");
        expect(runs[0]?.endDate).toBe("2026-06-04");
    });
});
