import { cycleRecord, type InsertCycleRecord } from "@/db/schema/cycleRecord";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { profileSeed } from "./profileSeeder";

const defaultCycleRecord: InsertCycleRecord = {
    id: "cycle-record-1",
    profileId: profileSeed.id,
    startDate: "2026-06-01",
    endDate: "2026-06-28",
    cycleLength: 28,
    periodLength: 5,
    createdAt: "2026-06-29T08:00:00Z",
    updatedAt: "2026-06-29T08:00:00Z",
};

export const cycleRecordSeed = {
    id: defaultCycleRecord.id,
    profileId: defaultCycleRecord.profileId,
};

export async function seedCycleRecord(database: RealDatabase, overrides: Partial<InsertCycleRecord> = {}) {
    const values: InsertCycleRecord = {
        ...defaultCycleRecord,
        ...overrides,
    };

    await database.db.insert(cycleRecord).values(values);

    return values;
}
