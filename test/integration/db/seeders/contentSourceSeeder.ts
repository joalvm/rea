import { contentSource, type InsertContentSource } from "@/db/schema/contentSource";
import type { RealDatabase } from "@test/utils/createRealDatabase";

const defaultContentSource: InsertContentSource = {
    id: "content-source-1",
    labelKey: "source.who",
    sourceType: "medical_guideline",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
};

export const contentSourceSeed = {
    id: defaultContentSource.id,
};

export async function seedContentSource(database: RealDatabase, overrides: Partial<InsertContentSource> = {}) {
    const values: InsertContentSource = {
        ...defaultContentSource,
        ...overrides,
    };

    await database.db.insert(contentSource).values(values);

    return values;
}
