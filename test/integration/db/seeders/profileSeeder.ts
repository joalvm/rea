import { profile, type InsertProfile } from "@/db/schema/profile";
import type { RealDatabase } from "@test/utils/createRealDatabase";

const defaultProfile: InsertProfile = {
    id: "profile-1",
    name: "Rea User",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
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
