import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { pregnancyEpisode } from "@/db/schema/pregnancyEpisode";
import { profile } from "@/db/schema/profile";
import { pregnancyEpisodeSeed, seedPregnancyEpisode } from "@test/integration/db/seeders/pregnancyEpisodeSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Integración del esquema de pregnancyEpisode", () => {
    it("inserta y consulta un episodio de embarazo válido", async () => {
        await seedProfile(context.database);
        await seedPregnancyEpisode(context.database);

        const rows = await context.database.db
            .select()
            .from(pregnancyEpisode)
            .where(eq(pregnancyEpisode.id, pregnancyEpisodeSeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.profileId).toBe(profileSeed.id);
    });

    it("rechaza filas huérfanas y combinaciones inválidas del ciclo de vida", async () => {
        await expect(
            seedPregnancyEpisode(context.database, {
                id: "pregnancy-orphan",
                profileId: "missing-profile",
            }),
        ).rejects.toThrow();

        await seedProfile(context.database);

        await expect(
            seedPregnancyEpisode(context.database, {
                id: "pregnancy-invalid-range",
                lmpDate: "2026-03-10",
                endDate: "2026-03-01",
            }),
        ).rejects.toThrow();

        await expect(
            seedPregnancyEpisode(context.database, {
                id: "pregnancy-open-with-outcome",
                outcome: "birth",
            }),
        ).rejects.toThrow();
    });

    it("elimina en cascada cuando se elimina el perfil propietario", async () => {
        await seedProfile(context.database);
        await seedPregnancyEpisode(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM pregnancy_episodes");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
