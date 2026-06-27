import { reproductiveIntentHistory, type InsertReproductiveIntentHistory } from "@/db/schema/reproductiveIntentHistory";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { profileSeed } from "./profileSeeder";

const defaultReproductiveIntentHistory: InsertReproductiveIntentHistory = {
    id: "reproductive-intent-1",
    profileId: profileSeed.id,
    effectiveFrom: "2026-01-01",
    currentMode: "cycle_tracking",
    regularity: "regular",
    hormonalContraception: false,
    declaredCycleLength: 28,
    declaredPeriodLength: 5,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
};

export const reproductiveIntentHistorySeed = {
    id: defaultReproductiveIntentHistory.id,
    profileId: defaultReproductiveIntentHistory.profileId,
};

export async function seedReproductiveIntentHistory(
    database: RealDatabase,
    overrides: Partial<InsertReproductiveIntentHistory> = {},
) {
    const values: InsertReproductiveIntentHistory = {
        ...defaultReproductiveIntentHistory,
        ...overrides,
    };

    await database.db.insert(reproductiveIntentHistory).values(values);

    return values;
}
