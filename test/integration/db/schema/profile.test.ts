import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { profile } from "@/db/schema/profile";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("profile schema integration", () => {
    it("inserts and queries a valid profile on real SQLite", async () => {
        await seedProfile(context.database);

        const rows = await context.database.db.select().from(profile).where(eq(profile.id, profileSeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.id).toBe(profileSeed.id);
    });

    it("rejects invalid reminder constraints on real SQLite", async () => {
        await expect(
            context.database.db.insert(profile).values({
                id: "profile-invalid-interval",
                reminderIntervalHours: 25,
            }),
        ).rejects.toThrow();

        await expect(
            context.database.db.insert(profile).values({
                id: "profile-invalid-order",
                reminderWindowStart: "22:00",
                reminderWindowEnd: "09:00",
            }),
        ).rejects.toThrow();

        await expect(
            context.database.db.insert(profile).values({
                id: "profile-invalid-format",
                reminderWindowStart: "9:00",
            }),
        ).rejects.toThrow();
    });
});
