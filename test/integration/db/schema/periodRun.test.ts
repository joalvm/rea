import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { periodRun } from "@/db/schema/periodRun";
import { profile } from "@/db/schema/profile";
import { periodRunSeed, seedPeriodRun } from "@test/integration/db/seeders/periodRunSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Integración del esquema de periodRun", () => {
    it("inserta y consulta un tramo de periodo válido", async () => {
        await seedProfile(context.database);
        await seedPeriodRun(context.database);

        const rows = await context.database.db.select().from(periodRun).where(eq(periodRun.id, periodRunSeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.profileId).toBe(profileSeed.id);
    });

    it("rechaza filas huérfanas y rangos de fechas inválidos", async () => {
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

    it("hace cumplir la unicidad activa por fecha de inicio y solo permite un tramo abierto por usuaria", async () => {
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

        await expect(
            seedPeriodRun(context.database, {
                id: "period-run-second-open",
                startDate: "2026-06-02",
                createdAt: "2026-06-02T09:00:00Z",
                updatedAt: "2026-06-02T09:00:00Z",
            }),
        ).rejects.toThrow();
    });

    it("permite reinsertar tras el borrado suave cuando no lo bloquea otro tramo abierto", async () => {
        await seedProfile(context.database);

        await seedPeriodRun(context.database, {
            id: "period-run-soft-deleted",
            startDate: "2026-06-03",
            status: "closed",
            endDate: "2026-06-04",
            deletedAt: "2026-06-04T00:00:00Z",
            createdAt: "2026-06-03T08:00:00Z",
            updatedAt: "2026-06-03T08:00:00Z",
        });

        await seedPeriodRun(context.database, {
            id: "period-run-recreated",
            startDate: "2026-06-03",
            status: "closed",
            endDate: "2026-06-05",
            createdAt: "2026-06-03T09:00:00Z",
            updatedAt: "2026-06-03T09:00:00Z",
        });

        const rows = await context.database.client.execute({
            sql: "SELECT COUNT(*) AS total FROM period_runs WHERE user_id = ? AND start_date = ?",
            args: [profileSeed.id, "2026-06-03"],
        });

        expect(Number(rows.rows[0]?.total ?? 0)).toBe(2);
    });

    it("elimina en cascada cuando se elimina el perfil propietario", async () => {
        await seedProfile(context.database);
        await seedPeriodRun(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM period_runs");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
