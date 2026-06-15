import { periodRun, type InsertPeriodRun } from "@/db/schema/periodRun";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { profileSeed } from "./profileSeeder";

const defaultPeriodRun: InsertPeriodRun = {
    id: "period-run-1",
    profileId: profileSeed.id,
    startDate: "2026-06-01",
    endDate: "2026-06-05",
    createdAt: "2026-06-01T08:00:00Z",
    updatedAt: "2026-06-01T08:00:00Z",
};

export const periodRunSeed = {
    id: defaultPeriodRun.id,
    profileId: defaultPeriodRun.profileId,
};

export async function seedPeriodRun(database: RealDatabase, overrides: Partial<InsertPeriodRun> = {}) {
    const values: InsertPeriodRun = {
        ...defaultPeriodRun,
        ...overrides,
    };

    await database.db.insert(periodRun).values(values);

    return values;
}
