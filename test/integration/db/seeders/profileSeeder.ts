import { profile, type InsertProfile } from "@/db/schema/profile";
import type { RealDatabase } from "@test/utils/createRealDatabase";

const defaultProfile: InsertProfile = {
    id: "profile-1",
};

export const profileSeed = {
    id: defaultProfile.id,
};

export async function seedProfile(database: RealDatabase, overrides: Partial<InsertProfile> = {}) {
    const values: InsertProfile = {
        ...defaultProfile,
        ...overrides,
    };

    await database.db.insert(profile).values(values);

    return values;
}
