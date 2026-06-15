import { contentRule, type InsertContentRule } from "@/db/schema/contentRule";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { contentItemSeed } from "./contentItemSeeder";

const defaultContentRule: InsertContentRule = {
    id: "content-rule-1",
    contentItemId: contentItemSeed.id,
    triggerType: "general",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
};

export const contentRuleSeed = {
    id: defaultContentRule.id,
    contentItemId: defaultContentRule.contentItemId,
};

export async function seedContentRule(database: RealDatabase, overrides: Partial<InsertContentRule> = {}) {
    const values: InsertContentRule = {
        ...defaultContentRule,
        ...overrides,
    };

    await database.db.insert(contentRule).values(values);

    return values;
}
