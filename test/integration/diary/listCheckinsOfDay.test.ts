import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { listCheckinsOfDay } from "@/features/diary/entry/services/listCheckinsOfDay";
import { type FileDatabase, createFileDatabase } from "@test/utils/createFileDatabase";

import { seedMedicationCatalog, medicationCatalogSeed } from "../db/seeders/medicationCatalogSeeder";
import { seedProfile, profileSeed } from "../db/seeders/profileSeeder";
import { seedSymptomCatalog, symptomCatalogSeed } from "../db/seeders/symptomCatalogSeeder";

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

async function insertCheckinRow(
    db: Database,
    overrides: {
        id: string;
        recordedAt: string;
        localDate: string;
        bleedingIntensity?: number;
        mood?: number;
        energy?: number;
        note?: string;
    },
) {
    const now = "2026-07-01T00:00:00Z";
    await db.insert(checkin).values({
        id: overrides.id,
        profileId: profileSeed.id,
        recordedAt: overrides.recordedAt,
        localDate: overrides.localDate,
        bleedingIntensity: overrides.bleedingIntensity,
        mood: overrides.mood,
        energy: overrides.energy,
        note: overrides.note,
        createdAt: now,
        updatedAt: now,
    });
}

describe("Integración de listCheckinsOfDay", () => {
    it("devuelve [] cuando el día no tiene check-ins", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);

        const rows = await listCheckinsOfDay(db, {
            profileId: profileSeed.id,
            localDate: "2026-07-12",
        });

        expect(rows).toEqual([]);
    });

    it("adjunta síntomas y medicamentos al check-in", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedSymptomCatalog(context.database);
        await seedMedicationCatalog(context.database);

        await insertCheckinRow(db, {
            id: "c-1",
            recordedAt: "2026-07-12T10:00:00Z",
            localDate: "2026-07-12",
            bleedingIntensity: 2,
            mood: 4,
            note: "mañana tranquila",
        });

        await db.insert(checkinSymptom).values({
            checkinId: "c-1",
            symptomKey: symptomCatalogSeed.symptomKey,
            intensity: 3,
            createdAt: "2026-07-12T10:00:00Z",
            updatedAt: "2026-07-12T10:00:00Z",
        });
        await db.insert(checkinMedication).values({
            id: "cm-1",
            checkinId: "c-1",
            medicationId: medicationCatalogSeed.id,
            takenAt: "2026-07-12T10:00:00Z",
            relief: 2,
            createdAt: "2026-07-12T10:00:00Z",
            updatedAt: "2026-07-12T10:00:00Z",
        });

        const rows = await listCheckinsOfDay(db, {
            profileId: profileSeed.id,
            localDate: "2026-07-12",
        });

        expect(rows).toHaveLength(1);
        const detail = rows[0]!;
        expect(detail.id).toBe("c-1");
        expect(detail.bleedingIntensity).toBe(2);
        expect(detail.mood).toBe(4);
        expect(detail.note).toBe("mañana tranquila");
        expect(detail.symptoms).toEqual([{ symptomKey: symptomCatalogSeed.symptomKey, intensity: 3 }]);
        expect(detail.medications).toHaveLength(1);
        expect(detail.medications[0]?.medicationId).toBe(medicationCatalogSeed.id);
        expect(detail.medications[0]?.name).toBe("Ibuprofeno");
        expect(detail.medications[0]?.relief).toBe(2);
    });

    it("separa los síntomas de cada check-in (no cruzados)", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedSymptomCatalog(context.database);

        await insertCheckinRow(db, {
            id: "c-am",
            recordedAt: "2026-07-12T08:00:00Z",
            localDate: "2026-07-12",
        });
        await insertCheckinRow(db, {
            id: "c-pm",
            recordedAt: "2026-07-12T20:00:00Z",
            localDate: "2026-07-12",
        });

        await db.insert(checkinSymptom).values({
            checkinId: "c-am",
            symptomKey: symptomCatalogSeed.symptomKey,
            intensity: 1,
            createdAt: "2026-07-12T08:00:00Z",
            updatedAt: "2026-07-12T08:00:00Z",
        });
        await db.insert(checkinSymptom).values({
            checkinId: "c-pm",
            symptomKey: symptomCatalogSeed.symptomKey,
            intensity: 5,
            createdAt: "2026-07-12T20:00:00Z",
            updatedAt: "2026-07-12T20:00:00Z",
        });

        const rows = await listCheckinsOfDay(db, {
            profileId: profileSeed.id,
            localDate: "2026-07-12",
        });

        expect(rows).toHaveLength(2);
        // Orden desc por recordedAt: c-pm primero
        expect(rows[0]?.id).toBe("c-pm");
        expect(rows[1]?.id).toBe("c-am");
        expect(rows[0]?.symptoms[0]?.intensity).toBe(5);
        expect(rows[1]?.symptoms[0]?.intensity).toBe(1);
    });

    it("excluye síntomas y medicamentos soft-deleted", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedSymptomCatalog(context.database);
        await seedSymptomCatalog(context.database, { symptomKey: "symptom-extra", labelKey: "extra" });
        await seedMedicationCatalog(context.database);

        await insertCheckinRow(db, {
            id: "c-1",
            recordedAt: "2026-07-12T10:00:00Z",
            localDate: "2026-07-12",
        });

        await db.insert(checkinSymptom).values({
            checkinId: "c-1",
            symptomKey: symptomCatalogSeed.symptomKey,
            intensity: 3,
            createdAt: "2026-07-12T10:00:00Z",
            updatedAt: "2026-07-12T10:00:00Z",
        });
        await db.insert(checkinSymptom).values({
            checkinId: "c-1",
            symptomKey: "symptom-extra",
            intensity: 1,
            deletedAt: "2026-07-12T12:00:00Z",
            createdAt: "2026-07-12T10:00:00Z",
            updatedAt: "2026-07-12T10:00:00Z",
        });
        await db.insert(checkinMedication).values({
            id: "cm-deleted",
            checkinId: "c-1",
            medicationId: medicationCatalogSeed.id,
            takenAt: "2026-07-12T10:00:00Z",
            deletedAt: "2026-07-12T12:00:00Z",
            createdAt: "2026-07-12T10:00:00Z",
            updatedAt: "2026-07-12T10:00:00Z",
        });

        const rows = await listCheckinsOfDay(db, {
            profileId: profileSeed.id,
            localDate: "2026-07-12",
        });

        expect(rows).toHaveLength(1);
        expect(rows[0]?.symptoms).toHaveLength(1);
        expect(rows[0]?.symptoms[0]?.intensity).toBe(3);
        expect(rows[0]?.medications).toEqual([]);
    });
});
