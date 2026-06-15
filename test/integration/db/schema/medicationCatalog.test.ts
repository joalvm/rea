import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { medicationCatalog } from "@/db/schema/medicationCatalog";
import { profile } from "@/db/schema/profile";
import { medicationCatalogSeed, seedMedicationCatalog } from "@test/integration/db/seeders/medicationCatalogSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("medicationCatalog schema integration", () => {
    it("inserts and queries a valid medication catalog row", async () => {
        await seedProfile(context.database);
        await seedMedicationCatalog(context.database);

        const rows = await context.database.db
            .select()
            .from(medicationCatalog)
            .where(eq(medicationCatalog.id, medicationCatalogSeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.profileId).toBe(profileSeed.id);
    });

    it("rejects orphan rows and empty names", async () => {
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
            seedMedicationCatalog(context.database, {
                id: "medication-empty-normalized",
                normalizedName: "   ",
            }),
        ).rejects.toThrow();
    });

    it("enforces the active partial unique index and allows reinsertion after soft delete", async () => {
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

    it("cascades when the owning profile is deleted", async () => {
        await seedProfile(context.database);
        await seedMedicationCatalog(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM medication_catalog");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
