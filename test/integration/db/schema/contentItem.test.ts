import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { contentItem } from "@/db/schema/contentItem";
import { contentItemSeed, seedContentItem } from "@test/integration/db/seeders/contentItemSeeder";
import { seedContentSource } from "@test/integration/db/seeders/contentSourceSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Integración del esquema de contentItem", () => {
    it("inserta y consulta una fila válida de ítem de contenido", async () => {
        await seedContentSource(context.database);
        await seedContentItem(context.database);

        const rows = await context.database.db.select().from(contentItem).where(eq(contentItem.id, contentItemSeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.topic).toBe("hydration");
    });

    it("rechaza claves foráneas, valores de confianza y rangos editoriales inválidos", async () => {
        await expect(
            seedContentItem(context.database, {
                id: "content-item-orphan-source",
                sourceId: "missing-source",
            }),
        ).rejects.toThrow();

        await seedContentSource(context.database);

        await expect(
            context.database.client.execute({
                sql: `
                    INSERT INTO content_items (
                        id, content_type, topic, title_key, body_key, min_confidence, content_version, created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                args: [
                    "content-item-invalid-confidence",
                    "tip",
                    "hydration",
                    "content.title",
                    "content.body",
                    "extreme",
                    "v1",
                    "2026-01-01T00:00:00Z",
                    "2026-01-01T00:00:00Z",
                ],
            }),
        ).rejects.toThrow();

        await expect(
            seedContentItem(context.database, {
                id: "content-item-invalid-range",
                validFrom: "2026-06-10",
                validUntil: "2026-06-01",
            }),
        ).rejects.toThrow();
    });
});
