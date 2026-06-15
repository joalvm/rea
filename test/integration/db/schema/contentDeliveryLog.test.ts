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

describe("contentDeliveryLog schema integration", () => {
    it("inserts and queries a valid delivery log row", async () => {
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

    it("rejects orphan foreign keys and invalid surfaces", async () => {
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
                    INSERT INTO content_delivery_log (id, user_id, content_item_id, surface, shown_at)
                    VALUES (?, ?, ?, ?, ?)
                `,
                args: [
                    "content-delivery-invalid-surface",
                    profileSeed.id,
                    contentItemSeed.id,
                    "feed",
                    "2026-06-02T08:00:00Z",
                ],
            }),
        ).rejects.toThrow();
    });

    it("cascades when the owning content item is deleted", async () => {
        await seedProfile(context.database);
        await seedContentSource(context.database);
        await seedContentItem(context.database);
        await seedContentDeliveryLog(context.database);

        await context.database.db.delete(contentItem).where(eq(contentItem.id, contentItemSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM content_delivery_log");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });

    it("cascades when the owning profile is deleted", async () => {
        await seedProfile(context.database);
        await seedContentSource(context.database);
        await seedContentItem(context.database);
        await seedContentDeliveryLog(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM content_delivery_log");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
