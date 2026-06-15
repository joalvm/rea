import { dailySummary, type InsertDailySummary } from "@/db/schema/dailySummary";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { profileSeed } from "./profileSeeder";

const defaultDailySummary: InsertDailySummary = {
    profileId: profileSeed.id,
    localDate: "2026-06-02",
    updatedAt: "2026-06-02T23:59:00Z",
};

export const dailySummarySeed = {
    profileId: defaultDailySummary.profileId,
    localDate: defaultDailySummary.localDate,
};

export async function seedDailySummary(database: RealDatabase, overrides: Partial<InsertDailySummary> = {}) {
    const values: InsertDailySummary = {
        ...defaultDailySummary,
        ...overrides,
    };

    await database.db.insert(dailySummary).values(values);

    return values;
}
