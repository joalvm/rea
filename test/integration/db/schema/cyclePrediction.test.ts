import { describe, expect, it } from "@jest/globals";
import { and, eq } from "drizzle-orm";

import { cyclePrediction } from "@/db/schema/cyclePrediction";
import { profile } from "@/db/schema/profile";
import { cyclePredictionSeed, seedCyclePrediction } from "@test/integration/db/seeders/cyclePredictionSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("cyclePrediction schema integration", () => {
    it("inserts and queries a valid cycle prediction row", async () => {
        await seedProfile(context.database);
        await seedCyclePrediction(context.database);

        const rows = await context.database.db
            .select()
            .from(cyclePrediction)
            .where(
                and(
                    eq(cyclePrediction.profileId, cyclePredictionSeed.profileId),
                    eq(cyclePrediction.calculationDate, cyclePredictionSeed.calculationDate),
                ),
            );

        expect(rows).toHaveLength(1);
        expect(rows[0]?.profileId).toBe(profileSeed.id);
    });

    it("rejects orphan rows and duplicate composite keys", async () => {
        await expect(
            seedCyclePrediction(context.database, {
                profileId: "missing-profile",
            }),
        ).rejects.toThrow();

        await seedProfile(context.database);
        await seedCyclePrediction(context.database);

        await expect(seedCyclePrediction(context.database)).rejects.toThrow();
    });

    it("cascades when the owning profile is deleted", async () => {
        await seedProfile(context.database);
        await seedCyclePrediction(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM cycle_predictions");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
