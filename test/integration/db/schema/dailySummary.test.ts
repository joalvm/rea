import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { dailySummary } from "@/db/schema/dailySummary";
import { profile } from "@/db/schema/profile";
import { dailySummarySeed, seedDailySummary } from "@test/integration/db/seeders/dailySummarySeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { seedSymptomCatalog, symptomCatalogSeed } from "@test/integration/db/seeders/symptomCatalogSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Integración del esquema de dailySummary", () => {
    it("inserta y consulta una fila válida de resumen", async () => {
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

    it("rechaza claves compuestas duplicadas y claves foráneas o fechas inválidas", async () => {
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

        await expect(
            seedDailySummary(context.database, {
                localDate: "2026-06-05",
                cycleDay: 0,
            }),
        ).rejects.toThrow();

        await expect(
            seedDailySummary(context.database, {
                localDate: "2026-06-06",
                checkinCount: -1,
            }),
        ).rejects.toThrow();
    });

    it("elimina en cascada cuando se elimina el perfil propietario", async () => {
        await seedProfile(context.database);
        await seedDailySummary(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM daily_summary");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
