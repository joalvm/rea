import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { medicationCatalog } from "@/db/schema/medicationCatalog";
import { profile } from "@/db/schema/profile";
import { medicationCatalogSeed, seedMedicationCatalog } from "@test/integration/db/seeders/medicationCatalogSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Integración del esquema de medicationCatalog", () => {
    it("inserta y consulta una fila válida del catálogo de medicamentos", async () => {
        await seedProfile(context.database);
        await seedMedicationCatalog(context.database);

        const rows = await context.database.db
            .select()
            .from(medicationCatalog)
            .where(eq(medicationCatalog.id, medicationCatalogSeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.profileId).toBe(profileSeed.id);
    });

    it("rechaza filas huérfanas y nombres vacíos", async () => {
        await expect(
            seedMedicationCatalog(context.database, {
                id: "medication-orphan",
                profileId: "missing-profile",
            }),
        ).rejects.toThrow();

        await seedProfile(context.database);

        await expect(
            seedMedicationCatalog(context.database, {
                id: "medication-empty-name",
                name: "   ",
            }),
        ).rejects.toThrow();

        await expect(
            context.database.client.execute({
                sql: `
                    INSERT INTO medication_catalog (
                        id, user_id, name, normalized_name, is_pregnancy_safe, created_at, updated_at, version
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                args: [
                    "medication-invalid-pregnancy-safe",
                    profileSeed.id,
                    "Paracetamol",
                    "paracetamol",
                    4,
                    "2026-01-01T00:00:00Z",
                    "2026-01-01T00:00:00Z",
                    1,
                ],
            }),
        ).rejects.toThrow();
    });

    it("hace cumplir el índice único parcial activo y permite reinsertar tras el borrado suave", async () => {
        await seedProfile(context.database);
        await seedMedicationCatalog(context.database, {
            id: "medication-active-1",
        });

        await expect(
            seedMedicationCatalog(context.database, {
                id: "medication-active-2",
                createdAt: "2026-01-01T01:00:00Z",
                updatedAt: "2026-01-01T01:00:00Z",
            }),
        ).rejects.toThrow();

        await seedMedicationCatalog(context.database, {
            id: "medication-soft-deleted",
            name: "Paracetamol",
            normalizedName: "paracetamol",
            deletedAt: "2026-01-02T00:00:00Z",
        });

        await seedMedicationCatalog(context.database, {
            id: "medication-recreated",
            name: "Paracetamol",
            normalizedName: "paracetamol",
            createdAt: "2026-01-03T00:00:00Z",
            updatedAt: "2026-01-03T00:00:00Z",
        });

        const rows = await context.database.client.execute({
            sql: "SELECT COUNT(*) AS total FROM medication_catalog WHERE user_id = ? AND normalized_name = ?",
            args: [profileSeed.id, "paracetamol"],
        });

        expect(Number(rows.rows[0]?.total ?? 0)).toBe(2);
    });

    it("elimina en cascada cuando se elimina el perfil propietario", async () => {
        await seedProfile(context.database);
        await seedMedicationCatalog(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM medication_catalog");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
