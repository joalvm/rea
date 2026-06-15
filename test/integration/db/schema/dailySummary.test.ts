import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { dailySummary } from "@/db/schema/dailySummary";
import { profile } from "@/db/schema/profile";
import { dailySummarySeed, seedDailySummary } from "@test/integration/db/seeders/dailySummarySeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { seedSymptomCatalog, symptomCatalogSeed } from "@test/integration/db/seeders/symptomCatalogSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("dailySummary schema integration", () => {
    it("inserts and queries a valid summary row", async () => {
        await seedProfile(context.database);
        await seedSymptomCatalog(context.database);
        await seedDailySummary(context.database, {
            topSymptomKey: symptomCatalogSeed.symptomKey,
        });

        const rows = await context.database.db
            .select()
            .from(dailySummary)
            .where(eq(dailySummary.localDate, dailySummarySeed.localDate));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.profileId).toBe(profileSeed.id);
    });

    it("rejects duplicate composite keys and invalid foreign keys or dates", async () => {
        await seedProfile(context.database);
        await seedSymptomCatalog(context.database);
        await seedDailySummary(context.database, {
            topSymptomKey: symptomCatalogSeed.symptomKey,
        });

        await expect(seedDailySummary(context.database)).rejects.toThrow();

        await expect(
            seedDailySummary(context.database, {
                localDate: "2026-06-03",
                topSymptomKey: "missing-symptom",
            }),
        ).rejects.toThrow();

        await expect(
            seedDailySummary(context.database, {
                localDate: "bad-date",
            }),
        ).rejects.toThrow();

        await expect(
            seedDailySummary(context.database, {
                localDate: "2026-06-04",
                maxSymptomIntensity: 7,
            }),
        ).rejects.toThrow();
    });

    it("cascades when the owning profile is deleted", async () => {
        await seedProfile(context.database);
        await seedDailySummary(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM daily_summary");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
