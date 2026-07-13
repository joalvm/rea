import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { eq, isNull } from "drizzle-orm";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { createCheckin } from "@/features/checkin/shared/services/createCheckin";
import { updateCheckin } from "@/features/checkin/shared/services/updateCheckin";
import { getCheckinById } from "@/features/checkin/shared/services/getCheckinById";
import { INITIAL_CHECKIN_DRAFT, type CheckinDraft } from "@/features/checkin/shared/types/CheckinDraft";
import { seedMedicationCatalog, medicationCatalogSeed } from "@test/integration/db/seeders/medicationCatalogSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { seedReproductiveIntentHistory } from "@test/integration/db/seeders/reproductiveIntentHistorySeeder";
import { seedSymptomCatalog, symptomCatalogSeed } from "@test/integration/db/seeders/symptomCatalogSeeder";
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

function buildDraft(overrides: Partial<CheckinDraft> = {}): CheckinDraft {
    return {
        ...INITIAL_CHECKIN_DRAFT,
        localDate: "2026-06-02",
        ...overrides,
    };
}

describe("Integración de updateCheckin", () => {
    it("actualiza la fila preservando recordedAt y createdAt", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        const id = await createCheckin(db, {
            profileId: profileSeed.id,
            draft: buildDraft({ bleedingIntensity: 1, mood: 2 }),
        });

        const [before] = await db.select().from(checkin).where(eq(checkin.id, id!));
        const originalRecordedAt = before?.recordedAt;
        const originalCreatedAt = before?.createdAt;

        await updateCheckin(db, {
            profileId: profileSeed.id,
            checkinId: id!,
            previousLocalDate: "2026-06-02",
            draft: buildDraft({ bleedingIntensity: 4, mood: 5 }),
        });

        const [after] = await db.select().from(checkin).where(eq(checkin.id, id!));
        expect(after?.bleedingIntensity).toBe(4);
        expect(after?.mood).toBe(5);
        expect(after?.recordedAt).toBe(originalRecordedAt);
        expect(after?.createdAt).toBe(originalCreatedAt);
        expect(after?.updatedAt).not.toBe(before?.updatedAt);
        expect(after?.version).toBe((before?.version ?? 1) + 1);
    });

    it("reemplaza síntomas y medicamentos (soft-delete + insert nuevos)", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedSymptomCatalog(context.database);
        await seedSymptomCatalog(context.database, { symptomKey: "symptom-2", labelKey: "s2" });
        await seedMedicationCatalog(context.database);

        const id = await createCheckin(db, {
            profileId: profileSeed.id,
            draft: buildDraft({
                symptoms: [{ symptomKey: symptomCatalogSeed.symptomKey, intensity: 3 }],
                medications: [{ medicationId: medicationCatalogSeed.id, relief: 2 }],
            }),
        });

        await updateCheckin(db, {
            profileId: profileSeed.id,
            checkinId: id!,
            previousLocalDate: "2026-06-02",
            draft: buildDraft({
                symptoms: [{ symptomKey: "symptom-2", intensity: 5 }],
            }),
        });

        // Síntomas activos: solo el nuevo.
        const activeSymptoms = await db
            .select()
            .from(checkinSymptom)
            .where(eq(checkinSymptom.checkinId, id!));
        expect(activeSymptoms.filter((s) => s.deletedAt === null)).toHaveLength(1);
        expect(activeSymptoms.find((s) => s.deletedAt === null)?.symptomKey).toBe("symptom-2");

        // Meds activos: ninguno (el draft no trajo meds).
        const activeMeds = await db
            .select()
            .from(checkinMedication)
            .where(eq(checkinMedication.checkinId, id!));
        expect(activeMeds.filter((m) => m.deletedAt === null)).toHaveLength(0);
    });

    it("getCheckinById refleja los cambios tras update", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedSymptomCatalog(context.database);
        await seedMedicationCatalog(context.database);

        const id = await createCheckin(db, {
            profileId: profileSeed.id,
            draft: buildDraft({ bleedingIntensity: 1 }),
        });

        await updateCheckin(db, {
            profileId: profileSeed.id,
            checkinId: id!,
            previousLocalDate: "2026-06-02",
            draft: buildDraft({
                bleedingIntensity: 3,
                symptoms: [{ symptomKey: symptomCatalogSeed.symptomKey, intensity: 4 }],
            }),
        });

        const record = await getCheckinById(db, { profileId: profileSeed.id, checkinId: id! });
        expect(record).not.toBeNull();
        expect(record?.snapshot.bleedingIntensity).toBe(3);
        expect(record?.snapshot.symptoms).toEqual([{ symptomKey: symptomCatalogSeed.symptomKey, intensity: 4 }]);
    });

    it("lanza si el registro no existe o está borrado", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        await expect(
            updateCheckin(db, {
                profileId: profileSeed.id,
                checkinId: "no-existe",
                previousLocalDate: "2026-06-02",
                draft: buildDraft(),
            }),
        ).rejects.toThrow();
    });
});
