import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import {
    seedSymptomCatalog as seedRuntimeSymptomCatalog,
    symptomCatalogSeedRows,
} from "@/db/seeders/symptomCatalogSeeder";
import { symptomCatalog } from "@/db/schema/symptomCatalog";
import { seedSymptomCatalog, symptomCatalogSeed } from "@test/integration/db/seeders/symptomCatalogSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Integración del esquema de symptomCatalog", () => {
    it("inserta y consulta una fila válida del catálogo de síntomas", async () => {
        await seedSymptomCatalog(context.database);

        const rows = await context.database.db
            .select()
            .from(symptomCatalog)
            .where(eq(symptomCatalog.symptomKey, symptomCatalogSeed.symptomKey));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.groupKey).toBe("pain");
    });

    it("rechaza valores inválidos de enum y boolean en SQLite real", async () => {
        await expect(
            context.database.client.execute({
                sql: `
                    INSERT INTO symptom_catalog (
                        symptom_key, group_key, label_key, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?)
                `,
                args: ["invalid-group", "mind", "symptom.invalid", "2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z"],
            }),
        ).rejects.toThrow();

        await expect(
            context.database.client.execute({
                sql: `
                    INSERT INTO symptom_catalog (
                        symptom_key, group_key, label_key, is_active, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?)
                `,
                args: [
                    "invalid-boolean",
                    "pain",
                    "symptom.invalid.boolean",
                    2,
                    "2026-01-01T00:00:00Z",
                    "2026-01-01T00:00:00Z",
                ],
            }),
        ).rejects.toThrow();
    });

    it("aplica el seeder en tiempo de ejecución y desactiva filas ausentes del catálogo canónico", async () => {
        await context.database.client.execute({
            sql: `
                INSERT INTO symptom_catalog (
                    symptom_key, group_key, label_key, ui_priority, is_quick_option, is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            args: [
                "legacy-symptom",
                "other",
                "legacy.symptom",
                999,
                0,
                1,
                "2026-01-01T00:00:00Z",
                "2026-01-01T00:00:00Z",
            ],
        });

        await seedRuntimeSymptomCatalog({
            execAsync(source) {
                return context.database.client.executeMultiple(source);
            },
        });

        const seededRows = await context.database.db.select().from(symptomCatalog);
        const legacyRows = await context.database.db
            .select()
            .from(symptomCatalog)
            .where(eq(symptomCatalog.symptomKey, "legacy-symptom"));

        expect(seededRows).toHaveLength(symptomCatalogSeedRows.length + 1);
        expect(legacyRows[0]?.isActive).toBe(false);
        expect(seededRows.find((row) => row.symptomKey === symptomCatalogSeedRows[0]?.symptomKey)?.labelKey).toBe(
            symptomCatalogSeedRows[0]?.labelKey,
        );
    });

    it("cada síntoma del catálogo resuelve su labelKey y populate applicable_mode", async () => {
        await seedRuntimeSymptomCatalog({
            execAsync(source) {
                return context.database.client.executeMultiple(source);
            },
        });

        const rows = await context.database.db.select().from(symptomCatalog);

        // Todos tienen applicable_mode explícito (no queda con el default opaco)
        for (const row of rows) {
            expect(row.applicableMode).toBeTruthy();
            expect(row.labelKey).toMatch(/^checkIn:symptoms\.\w+$/);
        }

        // Los síntomas de embarazo solo aplican a pregnancy_tracking
        const pregnancyOnly = rows.filter((row) => row.applicableMode === "pregnancy_tracking");
        expect(pregnancyOnly.length).toBeGreaterThanOrEqual(10);
        expect(pregnancyOnly.map((row) => row.symptomKey)).toContain("heartburn");
        expect(pregnancyOnly.map((row) => row.symptomKey)).toContain("braxton_hicks");
        expect(pregnancyOnly.map((row) => row.symptomKey)).toContain("sciatica");
    });
});
