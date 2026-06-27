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

    it("rejects invalid birth year constraints on real SQLite", async () => {
        await expect(
            context.database.db.insert(profile).values({
                id: "profile-invalid-birth-year",
                name: "Profile invalid birth year",
                birthYear: 1800,
                createdAt: "2026-01-01T00:00:00Z",
                updatedAt: "2026-01-01T00:00:00Z",
            }),
        ).rejects.toThrow();
    });
});
