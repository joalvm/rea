import { contentItem, type InsertContentItem } from "@/db/schema/contentItem";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { contentSourceSeed } from "./contentSourceSeeder";

const defaultContentItem: InsertContentItem = {
    id: "content-item-1",
    contentType: "tip",
    topic: "hydration",
    titleKey: "content.hydration.title",
    bodyKey: "content.hydration.body",
    sourceId: contentSourceSeed.id,
    contentVersion: "v1",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
};

export const contentItemSeed = {
    id: defaultContentItem.id,
    sourceId: defaultContentItem.sourceId,
};

export async function seedContentItem(database: RealDatabase, overrides: Partial<InsertContentItem> = {}) {
    const values: InsertContentItem = {
        ...defaultContentItem,
        ...overrides,
    };

    await database.db.insert(contentItem).values(values);

    return values;
}
