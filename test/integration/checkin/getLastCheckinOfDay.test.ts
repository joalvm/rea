import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { getLastCheckinOfDay } from "@/features/checkin/shared/services/getLastCheckinOfDay";
import { type FileDatabase, createFileDatabase } from "@test/utils/createFileDatabase";

import { seedMedicationCatalog, medicationCatalogSeed } from "../db/seeders/medicationCatalogSeeder";
import { seedProfile, profileSeed } from "../db/seeders/profileSeeder";
import { seedReproductiveIntentHistory } from "../db/seeders/reproductiveIntentHistorySeeder";
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
        mood?: number;
        energy?: number;
        note?: string;
    },
) {
    const now = "2026-06-02T00:00:00Z";
    await db.insert(checkin).values({
        id: overrides.id,
        profileId: profileSeed.id,
        recordedAt: overrides.recordedAt,
        localDate: overrides.localDate,
        mood: overrides.mood ?? 3,
        energy: overrides.energy,
        note: overrides.note,
        createdAt: now,
        updatedAt: now,
    });
}

describe("Integración de getLastCheckinOfDay", () => {
    it("devuelve null cuando no hay check-ins para el día", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        const snapshot = await getLastCheckinOfDay(db, {
            profileId: profileSeed.id,
            localDate: "2026-06-02",
        });

        expect(snapshot).toBeNull();
    });

    it("devuelve un snapshot con síntomas y medicamentos del check-in", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedSymptomCatalog(context.database);
        await seedMedicationCatalog(context.database);

        await insertCheckinRow(db, {
            id: "checkin-1",
            recordedAt: "2026-06-02T10:00:00Z",
            localDate: "2026-06-02",
            mood: 4,
            energy: 3,
            note: "Día tranquilo",
        });

        await db.insert(checkinSymptom).values({
            checkinId: "checkin-1",
            symptomKey: symptomCatalogSeed.symptomKey,
            intensity: 3,
            createdAt: "2026-06-02T10:00:00Z",
            updatedAt: "2026-06-02T10:00:00Z",
        });

        await db.insert(checkinMedication).values({
            id: "cm-1",
            checkinId: "checkin-1",
            medicationId: medicationCatalogSeed.id,
            takenAt: "2026-06-02T10:00:00Z",
            relief: 2,
            doseNote: "400 mg",
            createdAt: "2026-06-02T10:00:00Z",
            updatedAt: "2026-06-02T10:00:00Z",
        });

        const snapshot = await getLastCheckinOfDay(db, {
            profileId: profileSeed.id,
            localDate: "2026-06-02",
        });

        expect(snapshot).not.toBeNull();
        expect(snapshot?.mood).toBe(4);
        expect(snapshot?.energy).toBe(3);
        expect(snapshot?.note).toBe("Día tranquilo");
        expect(snapshot?.symptoms).toEqual([{ symptomKey: symptomCatalogSeed.symptomKey, intensity: 3 }]);
        const meds = snapshot?.medications;
        expect(meds).toHaveLength(1);
        expect(meds?.[0]?.medicationId).toBe(medicationCatalogSeed.id);
        expect(meds?.[0]?.name).toBe("Ibuprofeno");
        expect(meds?.[0]?.relief).toBe(2);
        expect(meds?.[0]?.doseNote).toBe("400 mg");
    });

    it("devuelve el check-in más reciente cuando hay varios en el día", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        await insertCheckinRow(db, {
            id: "checkin-morning",
            recordedAt: "2026-06-02T08:00:00Z",
            localDate: "2026-06-02",
            mood: 2,
        });
        await insertCheckinRow(db, {
            id: "checkin-evening",
            recordedAt: "2026-06-02T20:00:00Z",
            localDate: "2026-06-02",
            mood: 5,
        });

        const snapshot = await getLastCheckinOfDay(db, {
            profileId: profileSeed.id,
            localDate: "2026-06-02",
        });

        expect(snapshot).not.toBeNull();
        expect(snapshot?.mood).toBe(5);
    });

    it("devuelve null cuando el único check-in es de otro día", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        await insertCheckinRow(db, {
            id: "checkin-yesterday",
            recordedAt: "2026-06-01T22:00:00Z",
            localDate: "2026-06-01",
            mood: 3,
        });

        const snapshot = await getLastCheckinOfDay(db, {
            profileId: profileSeed.id,
            localDate: "2026-06-02",
        });

        expect(snapshot).toBeNull();
    });
});
