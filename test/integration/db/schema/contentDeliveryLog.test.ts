import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { contentDeliveryLog } from "@/db/schema/contentDeliveryLog";
import { contentItem } from "@/db/schema/contentItem";
import { profile } from "@/db/schema/profile";
import { contentDeliveryLogSeed, seedContentDeliveryLog } from "@test/integration/db/seeders/contentDeliveryLogSeeder";
import { contentItemSeed, seedContentItem } from "@test/integration/db/seeders/contentItemSeeder";
import { seedContentSource } from "@test/integration/db/seeders/contentSourceSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Integración del esquema de contentDeliveryLog", () => {
    it("inserta y consulta una fila válida del registro de entrega", async () => {
        await seedProfile(context.database);
        await seedContentSource(context.database);
        await seedContentItem(context.database);
        await seedContentDeliveryLog(context.database);

        const rows = await context.database.db
            .select()
            .from(contentDeliveryLog)
            .where(eq(contentDeliveryLog.id, contentDeliveryLogSeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.surface).toBe("today");
    });

    it("rechaza claves foráneas huérfanas y superficies inválidas", async () => {
        await expect(
            seedContentDeliveryLog(context.database, {
                id: "content-delivery-missing-profile",
                profileId: "missing-profile",
            }),
        ).rejects.toThrow();

        await seedProfile(context.database);
        await seedContentSource(context.database);

        await expect(
            seedContentDeliveryLog(context.database, {
                id: "content-delivery-missing-item",
                contentItemId: "missing-content-item",
            }),
        ).rejects.toThrow();

        await seedContentItem(context.database);

        await expect(
            context.database.client.execute({
                sql: `
                    INSERT INTO content_delivery_log (id, user_id, content_item_id, content_version, surface, shown_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                `,
                args: [
                    "content-delivery-invalid-surface",
                    profileSeed.id,
                    contentItemSeed.id,
                    "v1",
                    "feed",
                    "2026-06-02T08:00:00Z",
                ],
            }),
        ).rejects.toThrow();
    });

    it("elimina en cascada cuando se elimina el ítem de contenido propietario", async () => {
        await seedProfile(context.database);
        await seedContentSource(context.database);
        await seedContentItem(context.database);
        await seedContentDeliveryLog(context.database);

        await context.database.db.delete(contentItem).where(eq(contentItem.id, contentItemSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM content_delivery_log");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });

    it("elimina en cascada cuando se elimina el perfil propietario", async () => {
        await seedProfile(context.database);
        await seedContentSource(context.database);
        await seedContentItem(context.database);
        await seedContentDeliveryLog(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM content_delivery_log");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
