import { medicationCatalog, type InsertMedicationCatalog } from "@/db/schema/medicationCatalog";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { profileSeed } from "./profileSeeder";

const defaultMedicationCatalog: InsertMedicationCatalog = {
    id: "medication-1",
    profileId: profileSeed.id,
    name: "Ibuprofeno",
    normalizedName: "ibuprofeno",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
};

export const medicationCatalogSeed = {
    id: defaultMedicationCatalog.id,
    profileId: defaultMedicationCatalog.profileId,
};

export async function seedMedicationCatalog(database: RealDatabase, overrides: Partial<InsertMedicationCatalog> = {}) {
    const values: InsertMedicationCatalog = {
        ...defaultMedicationCatalog,
        ...overrides,
    };

    await database.db.insert(medicationCatalog).values(values);

    return values;
}
