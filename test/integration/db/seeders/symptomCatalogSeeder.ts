import { symptomCatalog, type InsertSymptomCatalog } from "@/db/schema/symptomCatalog";
import type { RealDatabase } from "@test/utils/createRealDatabase";

const defaultSymptomCatalog: InsertSymptomCatalog = {
    symptomKey: "cramps",
    groupKey: "pain",
    labelKey: "symptom.cramps",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
};

export const symptomCatalogSeed = {
    symptomKey: defaultSymptomCatalog.symptomKey,
};

export async function seedSymptomCatalog(database: RealDatabase, overrides: Partial<InsertSymptomCatalog> = {}) {
    const values: InsertSymptomCatalog = {
        ...defaultSymptomCatalog,
        ...overrides,
    };

    await database.db.insert(symptomCatalog).values(values);

    return values;
}
