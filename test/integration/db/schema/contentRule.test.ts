import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { contentItem } from "@/db/schema/contentItem";
import { contentRule } from "@/db/schema/contentRule";
import { contentRuleSeed, seedContentRule } from "@test/integration/db/seeders/contentRuleSeeder";
import { seedContentItem } from "@test/integration/db/seeders/contentItemSeeder";
import { seedContentSource } from "@test/integration/db/seeders/contentSourceSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Integración del esquema de contentRule", () => {
    it("inserta y consulta una fila válida de regla de contenido", async () => {
        await seedContentSource(context.database);
        await seedContentItem(context.database);
        await seedContentRule(context.database);

        const rows = await context.database.db.select().from(contentRule).where(eq(contentRule.id, contentRuleSeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.triggerType).toBe("general");
    });

    it("rechaza reglas huérfanas y tipos de disparador inválidos", async () => {
        await expect(
            seedContentRule(context.database, {
                id: "content-rule-orphan",
                contentItemId: "missing-content-item",
            }),
        ).rejects.toThrow();

        await seedContentSource(context.database);
        await seedContentItem(context.database);

        await expect(
            context.database.client.execute({
                sql: `
                    INSERT INTO content_rules (id, content_item_id, trigger_type, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?)
                `,
                args: [
                    "content-rule-invalid-trigger",
                    contentRuleSeed.contentItemId,
                    "unknown",
                    "2026-01-01T00:00:00Z",
                    "2026-01-01T00:00:00Z",
                ],
            }),
        ).rejects.toThrow();
    });

    it("elimina en cascada cuando se elimina el ítem de contenido propietario", async () => {
        await seedContentSource(context.database);
        await seedContentItem(context.database);
        await seedContentRule(context.database);

        await context.database.db.delete(contentItem).where(eq(contentItem.id, contentRuleSeed.contentItemId));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM content_rules");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
