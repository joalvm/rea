import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { checkin } from "@/db/schema/checkin";
import { profile } from "@/db/schema/profile";
import { checkinSeed, seedCheckin } from "@test/integration/db/seeders/checkinSeeder";
import { profileSeed, seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Integración del esquema de checkin", () => {
    it("inserta y consulta un check-in válido", async () => {
        await seedProfile(context.database);
        await seedCheckin(context.database);

        const rows = await context.database.db.select().from(checkin).where(eq(checkin.id, checkinSeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.profileId).toBe(profileSeed.id);
    });

    it("rechaza filas huérfanas y restricciones inválidas de métricas o fechas", async () => {
        await expect(
            seedCheckin(context.database, {
                id: "checkin-orphan",
                profileId: "missing-profile",
            }),
        ).rejects.toThrow();

        await seedProfile(context.database);

        await expect(
            seedCheckin(context.database, {
                id: "checkin-invalid-mood",
                mood: 8,
            }),
        ).rejects.toThrow();

        await expect(
            seedCheckin(context.database, {
                id: "checkin-invalid-date",
                localDate: "bad-date",
            }),
        ).rejects.toThrow();
    });

    it("elimina en cascada cuando se elimina el perfil propietario", async () => {
        await seedProfile(context.database);
        await seedCheckin(context.database);

        await context.database.db.delete(profile).where(eq(profile.id, profileSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM checkins");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
