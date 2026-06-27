import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { appSettings } from "@/db/schema/appSettings";
import { profile } from "@/db/schema/profile";
import { appSettingsSeed, seedAppSettings } from "@test/integration/db/seeders/appSettingsSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("appSettings schema integration", () => {
    it("inserts and queries a valid app settings row", async () => {
        await seedProfile(context.database);
        await seedAppSettings(context.database);

        const rows = await context.database.db
            .select()
            .from(appSettings)
            .where(eq(appSettings.userId, appSettingsSeed.userId));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.userId).toBe(profileSeed.id);
        expect(rows[0]?.theme).toBe("system");
        expect(rows[0]?.onboardingCompletedAt).toBeNull();
    });

    it("rejects orphan rows and invalid reminder or theme constraints", async () => {
        await expect(
            seedAppSettings(context.database, {
                userId: "missing-profile",
            }),
        ).rejects.toThrow();

        await seedProfile(context.database);

        await expect(
            seedAppSettings(context.database, {
                userId: profileSeed.id,
                reminderIntervalHours: 25,
            }),
        ).rejects.toThrow();

        await expect(
            context.database.client.execute({
                sql: `
                    INSERT INTO app_settings (
                        user_id, theme, created_at, updated_at, version
                    ) VALUES (?, ?, ?, ?, ?)
                `,
                args: [profileSeed.id, "sepia", "2026-01-01T00:00:00Z", "2026-01-01T00:00:00Z", 1],
            }),
        ).rejects.toThrow();
    });

    it("cascades when the owning profile is deleted", async () => {
        await seedProfile(context.database);
        await seedAppSettings(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM app_settings");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
