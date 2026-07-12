import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import type { Database } from "@/db/client";
import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { dailySummary } from "@/db/schema/dailySummary";
import { intercourseLog } from "@/db/schema/intercourseLog";
import { medicationCatalog } from "@/db/schema/medicationCatalog";
import { createCheckin } from "@/features/checkin/shared/services/createCheckin";
import { INITIAL_CHECKIN_DRAFT, type CheckinDraft } from "@/features/checkin/shared/types/CheckinDraft";
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

function buildDraft(overrides: Partial<CheckinDraft> = {}): CheckinDraft {
    return {
        ...INITIAL_CHECKIN_DRAFT,
        localDate: "2026-06-02",
        ...overrides,
    };
}

describe("Integración de createCheckin", () => {
    it("persiste un check-in completo con síntomas y medicamentos y recalcula el día", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedSymptomCatalog(context.database);
        await seedMedicationCatalog(context.database);

        const id = await createCheckin(db, {
            profileId: profileSeed.id,
            draft: buildDraft({
                bleedingIntensity: 2,
                clots: 1,
                mood: 4,
                energy: 3,
                stressLevel: 1,
                symptoms: [{ symptomKey: symptomCatalogSeed.symptomKey, intensity: 3 }],
                medications: [
                    {
                        medicationId: medicationCatalogSeed.id,
                        relief: 2,
                        doseNote: "400 mg",
                    },
                ],
                note: "Día tranquilo",
            }),
        });

        expect(id).not.toBeNull();

        const checkins = await db.select().from(checkin).where(eq(checkin.id, id!));
        expect(checkins).toHaveLength(1);
        expect(checkins[0]?.bleedingIntensity).toBe(2);
        expect(checkins[0]?.mood).toBe(4);
        expect(checkins[0]?.note).toBe("Día tranquilo");
        expect(checkins[0]?.excludedFromSummary).toBe(0);

        const symptoms = await db
            .select()
            .from(checkinSymptom)
            .where(eq(checkinSymptom.checkinId, id!));
        expect(symptoms).toHaveLength(1);
        expect(symptoms[0]?.symptomKey).toBe(symptomCatalogSeed.symptomKey);
        expect(symptoms[0]?.intensity).toBe(3);

        const meds = await db
            .select()
            .from(checkinMedication)
            .where(eq(checkinMedication.checkinId, id!));
        expect(meds).toHaveLength(1);
        expect(meds[0]?.medicationId).toBe(medicationCatalogSeed.id);
        expect(meds[0]?.relief).toBe(2);
        expect(meds[0]?.doseNote).toBe("400 mg");

        // recalculate escribió el resumen diario del día del check-in.
        const summaries = await db
            .select()
            .from(dailySummary)
            .where(eq(dailySummary.localDate, "2026-06-02"));
        expect(summaries.length).toBeGreaterThan(0);
    });

    it("materializa un medicamento escrito a mano en el catálogo personal", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        const id = await createCheckin(db, {
            profileId: profileSeed.id,
            draft: buildDraft({
                mood: 3,
                medications: [{ name: "Paracetamol", relief: 1 }],
            }),
        });

        expect(id).not.toBeNull();

        const catalogRows = await db
            .select()
            .from(medicationCatalog)
            .where(eq(medicationCatalog.profileId, profileSeed.id));
        expect(catalogRows).toHaveLength(1);
        expect(catalogRows[0]?.name).toBe("Paracetamol");
        expect(catalogRows[0]?.normalizedName).toBe("paracetamol");

        const meds = await db
            .select()
            .from(checkinMedication)
            .where(eq(checkinMedication.checkinId, id!));
        expect(meds).toHaveLength(1);
        expect(meds[0]?.medicationId).toBe(catalogRows[0]?.id);
    });

    it("revierte todo cuando se viola una restricción CHECK", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedSymptomCatalog(context.database);

        // bleedingIntensity fuera de rango (0–4) → CHECK revierte la transacción.
        await expect(
            createCheckin(db, {
                profileId: profileSeed.id,
                draft: buildDraft({
                    bleedingIntensity: 9,
                    symptoms: [{ symptomKey: symptomCatalogSeed.symptomKey, intensity: 2 }],
                }),
            }),
        ).rejects.toThrow();

        const checkins = await db.select().from(checkin);
        expect(checkins).toHaveLength(0);

        const symptoms = await db.select().from(checkinSymptom);
        expect(symptoms).toHaveLength(0);
    });

    it("reutiliza un medicamento del catálogo si el nombre normalizado ya existe", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);
        await seedMedicationCatalog(context.database);

        // El catálogo ya tiene "Ibuprofeno" (normalizado "ibuprofeno").
        // Lo añadimos por nombre manual; no debe duplicar el catálogo.
        const id = await createCheckin(db, {
            profileId: profileSeed.id,
            draft: buildDraft({
                energy: 3,
                medications: [{ name: "ibuprofeno" }],
            }),
        });

        expect(id).not.toBeNull();

        const catalogRows = await db
            .select()
            .from(medicationCatalog)
            .where(eq(medicationCatalog.profileId, profileSeed.id));
        expect(catalogRows).toHaveLength(1);
    });

    it("persiste campos de cuerpo y fertilidad (Fase 3)", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        const id = await createCheckin(db, {
            profileId: profileSeed.id,
            draft: buildDraft({
                cervicalMucus: 3,
                cervicalPosition: 2,
                basalBodyTempC: 36.5,
                basalBodyTempTime: "07:12",
                libido: 2,
                weightKg: 64.2,
                morningSickness: 1,
                fetalMovement: 2,
                opkResult: "positive",
                pregnancyTestResult: "negative",
            }),
        });

        expect(id).not.toBeNull();

        const rows = await db.select().from(checkin).where(eq(checkin.id, id!));
        expect(rows).toHaveLength(1);
        const row = rows[0];
        expect(row?.cervicalMucus).toBe(3);
        expect(row?.cervicalPosition).toBe(2);
        expect(row?.basalBodyTempC).toBe(36.5);
        expect(row?.basalBodyTempTime).toBe("07:12");
        expect(row?.libido).toBe(2);
        expect(row?.weightKg).toBe(64.2);
        expect(row?.morningSickness).toBe(1);
        expect(row?.fetalMovement).toBe(2);
        expect(row?.opkResult).toBe("positive");
        expect(row?.pregnancyTestResult).toBe("negative");
    });

    it("crea una fila en intercourse_log cuando el draft declara relaciones", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        const id = await createCheckin(db, {
            profileId: profileSeed.id,
            draft: buildDraft({
                mood: 3,
                intercourse: { isProtected: true },
            }),
        });

        expect(id).not.toBeNull();

        const events = await db
            .select()
            .from(intercourseLog)
            .where(eq(intercourseLog.profileId, profileSeed.id));
        expect(events).toHaveLength(1);
        expect(events[0]?.isProtected).toBe(true);
        expect(events[0]?.localDate).toBe("2026-06-02");
    });

    it("no crea fila en intercourse_log cuando el draft no declara relaciones", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        const id = await createCheckin(db, {
            profileId: profileSeed.id,
            draft: buildDraft({ mood: 3 }),
        });

        expect(id).not.toBeNull();

        const events = await db
            .select()
            .from(intercourseLog)
            .where(eq(intercourseLog.profileId, profileSeed.id));
        expect(events).toHaveLength(0);
    });

    it("acepta test de embarazo positivo y lo persiste (puente plan 10)", async () => {
        const db = context.database.db as unknown as Database;
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        const id = await createCheckin(db, {
            profileId: profileSeed.id,
            draft: buildDraft({
                pregnancyTestResult: "positive",
            }),
        });

        expect(id).not.toBeNull();

        const rows = await db.select().from(checkin).where(eq(checkin.id, id!));
        expect(rows[0]?.pregnancyTestResult).toBe("positive");
    });
});
