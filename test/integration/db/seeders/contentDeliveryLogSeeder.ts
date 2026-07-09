import { contentDeliveryLog, type InsertContentDeliveryLog } from "@/db/schema/contentDeliveryLog";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { contentItemSeed } from "./contentItemSeeder";
import { profileSeed } from "./profileSeeder";

const defaultContentDeliveryLog: InsertContentDeliveryLog = {
    id: "content-delivery-1",
    profileId: profileSeed.id,
    contentItemId: contentItemSeed.id,
    contentVersion: "v1",
    surface: "today",
    shownAt: "2026-06-02T08:00:00Z",
};

export const contentDeliveryLogSeed = {
    id: defaultContentDeliveryLog.id,
    profileId: defaultContentDeliveryLog.profileId,
};

export async function seedContentDeliveryLog(
    database: RealDatabase,
    overrides: Partial<InsertContentDeliveryLog> = {},
) {
    const values: InsertContentDeliveryLog = {
        ...defaultContentDeliveryLog,
        ...overrides,
    };

    await database.db.insert(contentDeliveryLog).values(values);

    return values;
}
