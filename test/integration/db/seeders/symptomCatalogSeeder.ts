import { symptomCatalogSeedRows } from "@/db/seeders/symptomCatalogSeeder";
import { symptomCatalog, type InsertSymptomCatalog } from "@/db/schema/symptomCatalog";
import type { RealDatabase } from "@test/utils/createRealDatabase";

const [defaultRuntimeSymptom] = symptomCatalogSeedRows;

if (defaultRuntimeSymptom == null) {
    throw new Error("symptomCatalogSeedRows debe definir al menos un síntoma");
}

const defaultSymptomCatalog: InsertSymptomCatalog = {
    symptomKey: defaultRuntimeSymptom.symptomKey,
    groupKey: defaultRuntimeSymptom.groupKey,
    labelKey: defaultRuntimeSymptom.labelKey,
    uiPriority: defaultRuntimeSymptom.uiPriority,
    isQuickOption: defaultRuntimeSymptom.isQuickOption,
    isActive: defaultRuntimeSymptom.isActive,
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
