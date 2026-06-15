import { checkinMedication, type InsertCheckinMedication } from "@/db/schema/checkinMedication";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { checkinSeed } from "./checkinSeeder";
import { medicationCatalogSeed } from "./medicationCatalogSeeder";

const defaultCheckinMedication: InsertCheckinMedication = {
    id: "checkin-medication-1",
    checkinId: checkinSeed.id,
    medicationId: medicationCatalogSeed.id,
    takenAt: "2026-06-02T11:00:00Z",
    relief: 1,
    createdAt: "2026-06-02T11:00:00Z",
    updatedAt: "2026-06-02T11:00:00Z",
};

export const checkinMedicationSeed = {
    id: defaultCheckinMedication.id,
    checkinId: defaultCheckinMedication.checkinId,
};

export async function seedCheckinMedication(database: RealDatabase, overrides: Partial<InsertCheckinMedication> = {}) {
    const values: InsertCheckinMedication = {
        ...defaultCheckinMedication,
        ...overrides,
    };

    await database.db.insert(checkinMedication).values(values);

    return values;
}
