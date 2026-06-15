import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { contentSource } from "@/db/schema/contentSource";
import { contentSourceSeed, seedContentSource } from "@test/integration/db/seeders/contentSourceSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("contentSource schema integration", () => {
    it("inserts and queries a valid content source row", async () => {
        await seedContentSource(context.database);

        const rows = await context.database.db
            .select()
            .from(contentSource)
            .where(eq(contentSource.id, contentSourceSeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.sourceType).toBe("medical_guideline");
    });

    it("rejects invalid source types on real SQLite", async () => {
        await expect(
            context.database.client.execute({
                sql: `
                    INSERT INTO content_sources (id, label_key, source_type, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?)
                `,
                args: [
                    "content-source-invalid",
                    "source.invalid",
                    "blog",
                    "2026-01-01T00:00:00Z",
                    "2026-01-01T00:00:00Z",
                ],
            }),
        ).rejects.toThrow();
    });
});
