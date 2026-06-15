import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { checkin } from "@/db/schema/checkin";
import { checkinMedication } from "@/db/schema/checkinMedication";
import { checkinSeed, seedCheckin } from "@test/integration/db/seeders/checkinSeeder";
import { checkinMedicationSeed, seedCheckinMedication } from "@test/integration/db/seeders/checkinMedicationSeeder";
import { medicationCatalogSeed, seedMedicationCatalog } from "@test/integration/db/seeders/medicationCatalogSeeder";
import { seedProfile } from "@test/integration/db/seeders/profileSeeder";
import { createDatabaseTestContext } from "@test/integration/db/utils/createDatabaseTestContext";

const context = createDatabaseTestContext();

describe("checkinMedication schema integration", () => {
    it("inserts and queries a valid medication event", async () => {
        await seedProfile(context.database);
        await seedMedicationCatalog(context.database);
        await seedCheckin(context.database);
        await seedCheckinMedication(context.database);

        const rows = await context.database.db
            .select()
            .from(checkinMedication)
            .where(eq(checkinMedication.id, checkinMedicationSeed.id));

        expect(rows).toHaveLength(1);
        expect(rows[0]?.medicationId).toBe(medicationCatalogSeed.id);
    });

    it("rejects missing parents and invalid relief", async () => {
        await seedProfile(context.database);
        await seedMedicationCatalog(context.database);
        await seedCheckin(context.database);

        await expect(
            seedCheckinMedication(context.database, {
                id: "checkin-medication-missing-checkin",
                checkinId: "missing-checkin",
            }),
        ).rejects.toThrow();

        await expect(
            seedCheckinMedication(context.database, {
                id: "checkin-medication-missing-medication",
                medicationId: "missing-medication",
            }),
        ).rejects.toThrow();

        await expect(
            seedCheckinMedication(context.database, {
                id: "checkin-medication-invalid-relief",
                relief: 4,
            }),
        ).rejects.toThrow();
    });

    it("cascades when the owning checkin is deleted", async () => {
        await seedProfile(context.database);
        await seedMedicationCatalog(context.database);
        await seedCheckin(context.database);
        await seedCheckinMedication(context.database);

        await context.database.db.delete(checkin).where(eq(checkin.id, checkinSeed.id));

        const remaining = await context.database.client.execute("SELECT COUNT(*) AS total FROM checkin_medications");

        expect(Number(remaining.rows[0]?.total ?? 0)).toBe(0);
    });
});
