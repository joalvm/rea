import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { profile } from "@/db/schema/profile";
import { reproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import {
    reproductiveIntentHistorySeed,
    seedReproductiveIntentHistory,
} from "@test/integration/db/seeders/reproductiveIntentHistorySeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("reproductiveIntentHistory schema integration", () => {
    it("inserts and queries a valid reproductive intent row", async () => {
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        const rows = await context.database.db
            .select()
            .from(reproductiveIntentHistory)
            .where(eq(reproductiveIntentHistory.id, reproductiveIntentHistorySeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.profileId).toBe(profileSeed.id);
        expect(rows[0]?.reproductiveMode).toBe("tracking_only");
    });

    it("rejects orphan rows and invalid lifecycle constraints", async () => {
        await expect(
            seedReproductiveIntentHistory(context.database, {
                id: "reproductive-intent-orphan",
                profileId: "missing-profile",
            }),
        ).rejects.toThrow();

        await seedProfile(context.database);

        await expect(
            seedReproductiveIntentHistory(context.database, {
                id: "reproductive-intent-invalid-range",
                effectiveFrom: "2026-02-10",
                effectiveTo: "2026-02-01",
            }),
        ).rejects.toThrow();

        await expect(
            seedReproductiveIntentHistory(context.database, {
                id: "reproductive-intent-invalid-cycle-length",
                effectiveFrom: "2026-02-01",
                declaredCycleLength: 10,
            }),
        ).rejects.toThrow();
    });

    it("rejects an unknown reproductive_mode value", async () => {
        await seedProfile(context.database);

        await expect(
            seedReproductiveIntentHistory(context.database, {
                id: "reproductive-intent-unknown-mode",
                effectiveFrom: "2026-02-01",
                reproductiveMode: "cycle_tracking" as never,
            }),
        ).rejects.toThrow();
    });

    it("rejects tracking_ttc together with hormonal contraception", async () => {
        await seedProfile(context.database);

        await expect(
            seedReproductiveIntentHistory(context.database, {
                id: "reproductive-intent-ttc-hormonal",
                effectiveFrom: "2026-02-01",
                reproductiveMode: "tracking_ttc",
                hormonalContraception: true,
            }),
        ).rejects.toThrow();
    });

    it("cascades when the owning profile is deleted", async () => {
        await seedProfile(context.database);
        await seedReproductiveIntentHistory(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute(
            "SELECT COUNT(*) AS total FROM reproductive_intent_history",
        );

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
