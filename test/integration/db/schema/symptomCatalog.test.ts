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

describe("symptomCatalog schema integration", () => {
    it("inserts and queries a valid symptom catalog row", async () => {
        await seedSymptomCatalog(context.database);

        const rows = await context.database.db
            .select()
            .from(symptomCatalog)
            .where(eq(symptomCatalog.symptomKey, symptomCatalogSeed.symptomKey));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.groupKey).toBe("pain");
    });

    it("rejects invalid enum and boolean values on real SQLite", async () => {
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

    it("applies runtime seeder and deactivates rows missing from canonical catalog", async () => {
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
});
