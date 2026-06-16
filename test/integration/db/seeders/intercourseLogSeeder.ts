import { intercourseLog, type InsertIntercourseLog } from "@/db/schema/intercourseLog";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { profileSeed } from "./profileSeeder";

const defaultIntercourseLog: InsertIntercourseLog = {
    id: "intercourse-1",
    profileId: profileSeed.id,
    occurredAt: "2026-04-02T21:15:00Z",
    localDate: "2026-04-02",
    isProtected: true,
    createdAt: "2026-04-02T21:15:00Z",
    updatedAt: "2026-04-02T21:15:00Z",
};

export const intercourseLogSeed = {
    id: defaultIntercourseLog.id,
    profileId: defaultIntercourseLog.profileId,
};

export async function seedIntercourseLog(database: RealDatabase, overrides: Partial<InsertIntercourseLog> = {}) {
    const values: InsertIntercourseLog = {
        ...defaultIntercourseLog,
        ...overrides,
    };

    await database.db.insert(intercourseLog).values(values);

    return values;
}
