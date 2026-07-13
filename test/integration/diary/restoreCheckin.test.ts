import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { eq, isNotNull } from "drizzle-orm";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { deleteCheckin } from "@/features/diary/entry/services/deleteCheckin";
import { restoreCheckin } from "@/features/diary/entry/services/restoreCheckin";
import { listCheckinsOfDay } from "@/features/diary/entry/services/listCheckinsOfDay";
import { seedCheckin } from "@test/integration/db/seeders/checkinSeeder";
import { seedCheckinMedication } from "@test/integration/db/seeders/checkinMedicationSeeder";
import { seedCheckinSymptom } from "@test/integration/db/seeders/checkinSymptomSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { seedReproductiveIntentHistory } from "@test/integration/db/seeders/reproductiveIntentHistorySeeder";
import { seedSymptomCatalog, symptomCatalogSeed } from "@test/integration/db/seeders/symptomCatalogSeeder";
import { seedMedicationCatalog, medicationCatalogSeed } from "@test/integration/db/seeders/medicationCatalogSeeder";
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

describe("Integración de restoreCheckin", () => {
    it("revierte el soft-delete de checkins, síntomas y medicamentos", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedSymptomCatalog(context.database);
        await seedMedicationCatalog(context.database);
        await seedCheckin(context.database, { id: "c-1", localDate: "2026-07-12", recordedAt: "2026-07-12T10:00:00Z" });
        await seedCheckinSymptom(context.database, { checkinId: "c-1", symptomKey: symptomCatalogSeed.symptomKey });
        await seedCheckinMedication(context.database, { id: "cm-1", checkinId: "c-1", medicationId: medicationCatalogSeed.id });

        await deleteCheckin(db, { profileId: profileSeed.id, checkinId: "c-1" });
        await restoreCheckin(db, { profileId: profileSeed.id, checkinId: "c-1" });

        const [row] = await db.select().from(checkin).where(eq(checkin.id, "c-1"));
        expect(row?.deletedAt).toBeNull();

        const activeSymptoms = await db
            .select()
            .from(checkinSymptom)
            .where(eq(checkinSymptom.checkinId, "c-1"));
        const deletedSymptoms = await db
            .select()
            .from(checkinSymptom)
            .where(isNotNull(checkinSymptom.deletedAt));
        expect(activeSymptoms.filter((s) => s.deletedAt === null)).toHaveLength(1);
        expect(deletedSymptoms).toHaveLength(0);

        const activeMeds = await db.select().from(checkinMedication).where(eq(checkinMedication.checkinId, "c-1"));
        expect(activeMeds.filter((m) => m.deletedAt === null)).toHaveLength(1);
    });

    it("el listado del día vuelve a mostrar el registro restaurado", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedCheckin(context.database, { id: "c-1", localDate: "2026-07-12", recordedAt: "2026-07-12T10:00:00Z" });

        await deleteCheckin(db, { profileId: profileSeed.id, checkinId: "c-1" });
        await restoreCheckin(db, { profileId: profileSeed.id, checkinId: "c-1" });

        const rows = await listCheckinsOfDay(db, { profileId: profileSeed.id, localDate: "2026-07-12" });
        expect(rows).toHaveLength(1);
        expect(rows[0]?.id).toBe("c-1");
    });

    it("lanza si el registro no existe", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        await expect(restoreCheckin(db, { profileId: profileSeed.id, checkinId: "no-existe" })).rejects.toThrow();
    });
});
