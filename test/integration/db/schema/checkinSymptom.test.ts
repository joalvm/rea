import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { checkin } from "@/db/schema/checkin";
import { checkinSymptom } from "@/db/schema/checkinSymptom";
import { checkinSeed, seedCheckin } from "@test/integration/db/seeders/checkinSeeder";
import { checkinSymptomSeed, seedCheckinSymptom } from "@test/integration/db/seeders/checkinSymptomSeeder";
import { seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { seedSymptomCatalog, symptomCatalogSeed } from "@test/integration/db/seeders/symptomCatalogSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("Integración del esquema de checkinSymptom", () => {
    it("inserta y consulta una fila puente válida", async () => {
        await seedProfile(context.database);
        await seedSymptomCatalog(context.database);
        await seedCheckin(context.database);
        await seedCheckinSymptom(context.database);

        const rows = await context.database.db
            .select()
            .from(checkinSymptom)
            .where(eq(checkinSymptom.checkinId, checkinSymptomSeed.checkinId));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.symptomKey).toBe(symptomCatalogSeed.symptomKey);
    });

    it("rechaza claves compuestas duplicadas, padres faltantes e intensidad inválida", async () => {
        await seedProfile(context.database);
        await seedSymptomCatalog(context.database);
        await seedCheckin(context.database);
        await seedCheckinSymptom(context.database);

        await expect(seedCheckinSymptom(context.database)).rejects.toThrow();

        await expect(
            seedCheckinSymptom(context.database, {
                checkinId: "missing-checkin",
            }),
        ).rejects.toThrow();

        await expect(
            seedCheckinSymptom(context.database, {
                symptomKey: "missing-symptom",
            }),
        ).rejects.toThrow();

        await seedSymptomCatalog(context.database, {
            symptomKey: "headache",
            labelKey: "checkIn:symptoms.headache",
        });

        await expect(
            seedCheckinSymptom(context.database, {
                checkinId: checkinSeed.id,
                symptomKey: "headache",
                intensity: 7,
            }),
        ).rejects.toThrow();
    });

    it("elimina en cascada cuando se elimina el check-in propietario", async () => {
        await seedProfile(context.database);
        await seedSymptomCatalog(context.database);
        await seedCheckin(context.database);
        await seedCheckinSymptom(context.database);

        await context.database.db.delete(checkin).where(eq(checkin.id, checkinSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM checkin_symptoms");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
