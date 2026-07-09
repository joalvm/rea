import { appSettings, type InsertAppSettings } from "@/db/schema/appSettings";
import type { RealDatabase } from "@test/utils/createRealDatabase";

import { profileSeed } from "./profileSeeder";

const defaultAppSettings: InsertAppSettings = {
    userId: profileSeed.id,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
};

export const appSettingsSeed = {
    userId: defaultAppSettings.userId,
};

export async function seedAppSettings(database: RealDatabase, overrides: Partial<InsertAppSettings> = {}) {
    const values: InsertAppSettings = {
        ...defaultAppSettings,
        ...overrides,
    };

    await database.db.insert(appSettings).values(values);

    return values;
}
