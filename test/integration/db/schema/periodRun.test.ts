import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { periodRun } from "@/db/schema/periodRun";
import { profile } from "@/db/schema/profile";
import { periodRunSeed, seedPeriodRun } from "@test/integration/db/seeders/periodRunSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("periodRun schema integration", () => {
    it("inserts and queries a valid period run", async () => {
        await seedProfile(context.database);
        await seedPeriodRun(context.database);

        const rows = await context.database.db.select().from(periodRun).where(eq(periodRun.id, periodRunSeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.profileId).toBe(profileSeed.id);
    });

    it("rejects orphan rows and invalid date ranges", async () => {
        await expect(
            seedPeriodRun(context.database, {
                id: "period-run-orphan",
                profileId: "missing-profile",
            }),
        ).rejects.toThrow();

        await seedProfile(context.database);

        await expect(
            seedPeriodRun(context.database, {
                id: "period-run-invalid-range",
                startDate: "2026-06-10",
                endDate: "2026-06-01",
            }),
        ).rejects.toThrow();
    });

    it("enforces the active partial unique index and allows reinsertion after soft delete", async () => {
        await seedProfile(context.database);
        await seedPeriodRun(context.database, {
            id: "period-run-active-1",
            startDate: "2026-06-01",
        });

        await expect(
            seedPeriodRun(context.database, {
                id: "period-run-active-2",
                startDate: "2026-06-01",
                createdAt: "2026-06-01T09:00:00Z",
                updatedAt: "2026-06-01T09:00:00Z",
            }),
        ).rejects.toThrow();

        await seedPeriodRun(context.database, {
            id: "period-run-soft-deleted",
            startDate: "2026-06-03",
            deletedAt: "2026-06-04T00:00:00Z",
            createdAt: "2026-06-03T08:00:00Z",
            updatedAt: "2026-06-03T08:00:00Z",
        });

        await seedPeriodRun(context.database, {
            id: "period-run-recreated",
            startDate: "2026-06-03",
            createdAt: "2026-06-03T09:00:00Z",
            updatedAt: "2026-06-03T09:00:00Z",
        });

        const rows = await context.database.client.execute({
            sql: "SELECT COUNT(*) AS total FROM period_runs WHERE user_id = ? AND start_date = ?",
            args: [profileSeed.id, "2026-06-03"],
        });

        expect(Number(rows.rows[0]?.total ?? 0)).toBe(2);
    });

    it("cascades when the owning profile is deleted", async () => {
        await seedProfile(context.database);
        await seedPeriodRun(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM period_runs");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
