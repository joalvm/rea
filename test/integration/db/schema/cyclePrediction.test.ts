import { describe, expect, it } from "@jest/globals";
import { and, eq } from "drizzle-orm";

import { cyclePrediction } from "@/db/schema/cyclePrediction";
import { profile } from "@/db/schema/profile";
import { cyclePredictionSeed, seedCyclePrediction } from "@test/integration/db/seeders/cyclePredictionSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Integración del esquema de cyclePrediction", () => {
    it("inserta y consulta una fila válida de predicción de ciclo", async () => {
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

    it("rechaza filas huérfanas y claves compuestas duplicadas", async () => {
        await expect(
            seedCyclePrediction(context.database, {
                profileId: "missing-profile",
            }),
        ).rejects.toThrow();

        await seedProfile(context.database);
        await seedCyclePrediction(context.database);

        await expect(seedCyclePrediction(context.database)).rejects.toThrow();
    });

    it("rechaza ventana fértil con solo un extremo presente", async () => {
        await seedProfile(context.database);

        await expect(
            seedCyclePrediction(context.database, {
                calculationDate: "2026-06-21",
                predictedFertileStart: "2026-06-16",
                predictedFertileEnd: null,
            }),
        ).rejects.toThrow();
    });

    it("rechaza predicted_period_length fuera de rango", async () => {
        await seedProfile(context.database);

        await expect(
            seedCyclePrediction(context.database, {
                calculationDate: "2026-06-22",
                predictedPeriodLength: 20,
            }),
        ).rejects.toThrow();
    });

    it("elimina en cascada cuando se elimina el perfil propietario", async () => {
        await seedProfile(context.database);
        await seedCyclePrediction(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM cycle_predictions");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
