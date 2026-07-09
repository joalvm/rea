import { checkinSymptom, type InsertCheckinSymptom } from "@/db/schema/checkinSymptom";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { checkinSeed } from "./checkinSeeder";
import { symptomCatalogSeed } from "./symptomCatalogSeeder";

const defaultCheckinSymptom: InsertCheckinSymptom = {
    checkinId: checkinSeed.id,
    symptomKey: symptomCatalogSeed.symptomKey,
    intensity: 3,
    createdAt: "2026-06-02T10:30:00Z",
    updatedAt: "2026-06-02T10:30:00Z",
};

export const checkinSymptomSeed = {
    checkinId: defaultCheckinSymptom.checkinId,
    symptomKey: defaultCheckinSymptom.symptomKey,
};

export async function seedCheckinSymptom(database: RealDatabase, overrides: Partial<InsertCheckinSymptom> = {}) {
    const values: InsertCheckinSymptom = {
        ...defaultCheckinSymptom,
        ...overrides,
    };

    await database.db.insert(checkinSymptom).values(values);

    return values;
}
